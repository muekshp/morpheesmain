import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import https from 'https';
import dns from 'dns';

// Force IPv4 DNS resolution to fix ENOTFOUND issues in Next.js
dns.setDefaultResultOrder('ipv4first');

export const maxDuration = 60; // Allow sufficient time for Google AI image generation

interface TryOnRequestBody {
  userPhoto: string;       // Base64 data URL or relative path
  sareeImageUrl?: string;  // Product/item image URL (local path or base64)
  sareeName?: string;      // Product name
  sareeCategory?: string;  // Category: Saree, Kurti, Western Wear, Jewellery, etc.
  accentColor?: string;
}

// ─── Universal item placement instruction per category ───────────────────────
function buildItemInstruction(category: string, itemName: string): string {
  const cat = (category || '').toLowerCase().trim();

  if (cat.includes('saree')) {
    return (
      `The item in Image 2 is a SAREE named "${itemName}". ` +
      `Dress the person in this saree: wrap the fabric around their body naturally, ` +
      `show authentic pleats at the waist, drape the pallu over the left shoulder, ` +
      `and expose a matching blouse/choli. Preserve every colour, embroidery, border, ` +
      `zari, and print detail of the saree exactly as it appears in Image 2.`
    );
  }

  if (cat.includes('lehenga')) {
    return (
      `The item in Image 2 is a LEHENGA SET named "${itemName}". ` +
      `Dress the person in this lehenga: the flared skirt should fall to the feet naturally, ` +
      `the choli/blouse should fit the upper body, and the dupatta should drape over the shoulder. ` +
      `Preserve every embroidery, colour, and fabric detail exactly.`
    );
  }

  if (cat.includes('kurti') || cat.includes('kurta')) {
    return (
      `The item in Image 2 is a KURTI/KURTA named "${itemName}". ` +
      `Replace the person's top garment with this kurti. Fit it naturally onto their body, ` +
      `preserving the exact neckline design, sleeve length, hem length, print, colour, ` +
      `and any embroidery or embellishments shown in Image 2.`
    );
  }

  if (cat.includes('western')) {
    return (
      `The item in Image 2 is a WESTERN WEAR outfit named "${itemName}". ` +
      `Replace the person's clothing with this outfit. Fit it naturally on their body ` +
      `preserving the exact silhouette, cut, colour, pattern, and fabric texture shown in Image 2. ` +
      `Do not change or guess the design — match it exactly.`
    );
  }

  if (cat.includes('men') || cat.includes('mens') || cat.includes("men's")) {
    return (
      `The item in Image 2 is a MEN'S WEAR outfit named "${itemName}". ` +
      `Replace the person's clothing with this outfit. Fit it naturally on their body, ` +
      `preserving the exact collar style, colour, fabric texture, pattern, and every ` +
      `design detail shown in Image 2.`
    );
  }

  if (cat.includes('footwear') || cat.includes('shoe') || cat.includes('sandal') || cat.includes('boot')) {
    return (
      `The item in Image 2 is FOOTWEAR named "${itemName}". ` +
      `Place these shoes/sandals/boots on the person's feet, replacing whatever footwear ` +
      `they are currently wearing (or bare feet). Show them clearly from the appropriate angle. ` +
      `Preserve the exact colour, sole design, straps, and material shown in Image 2.`
    );
  }

  if (cat.includes('jewellery') || cat.includes('jewelry') || cat.includes('necklace') ||
      cat.includes('earring') || cat.includes('bangle') || cat.includes('ring') || cat.includes('bracelet')) {
    return (
      `The item in Image 2 is JEWELLERY named "${itemName}". ` +
      `Add this jewellery onto the person in its natural position: ` +
      `if it is a necklace, place it around their neck; if earrings, at both ears; ` +
      `if bangles/bracelets, on the wrists; if a ring, on a finger; if a maang-tikka, on the forehead. ` +
      `Preserve the exact design, colour, metal finish, stones, and craftsmanship shown in Image 2. ` +
      `Keep the rest of the person's appearance completely unchanged.`
    );
  }

  if (cat.includes('accessories') || cat.includes('bag') || cat.includes('purse') ||
      cat.includes('scarf') || cat.includes('watch') || cat.includes('cap') || cat.includes('hat') || cat.includes('belt')) {
    return (
      `The item in Image 2 is an ACCESSORY named "${itemName}". ` +
      `Add or place this accessory on the person in its most natural position ` +
      `(e.g. bag in hand, scarf around neck, watch on wrist, cap/hat on head, belt at waist). ` +
      `Preserve the exact colour, design, material, and every detail shown in Image 2. ` +
      `Keep the rest of the person's appearance completely unchanged.`
    );
  }

  // Fallback — works for any unknown category
  return (
    `The item in Image 2 is named "${itemName}" (category: ${category || 'Fashion Item'}). ` +
    `Virtually try this item onto the person from Image 1. ` +
    `Place or wear it on the person in the most natural and realistic way possible, ` +
    `exactly as it would look when worn or carried in real life. ` +
    `Preserve every colour, design, texture, and detail of the item exactly as shown in Image 2.`
  );
}

// ─── Load image from local public folder or base64 data URL ──────────────────
function loadImagePart(
  url: string
): { mimeType: string; data: string } | null {
  if (!url) return null;

  if (url.startsWith('data:')) {
    const match = url.match(/^data:([^;]+);base64,(.+)$/);
    if (match) return { mimeType: match[1] || 'image/jpeg', data: match[2] };
    return null;
  }

  if (url.startsWith('/')) {
    try {
      const decoded = decodeURIComponent(url);
      const filePath = path.join(process.cwd(), 'public', decoded.replace(/^\//, ''));
      if (!fs.existsSync(filePath)) {
        console.warn(`[Try-on API] File not found: ${filePath}`);
        return null;
      }
      const buffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const mimeMap: Record<string, string> = {
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.avif': 'image/avif',
        '.gif': 'image/gif',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
      };
      const mimeType = mimeMap[ext] ?? 'image/jpeg';
      console.info(`[Try-on API] Loaded image: ${filePath} (${buffer.length} bytes, ${mimeType})`);
      return { mimeType, data: buffer.toString('base64') };
    } catch (err) {
      console.warn('[Try-on API] Failed to load image from path:', err);
      return null;
    }
  }

  return null;
}

// ─── Main API Route ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TryOnRequestBody;
    const {
      userPhoto,
      sareeImageUrl,
      sareeName = 'Fashion Item',
      sareeCategory = 'Fashion',
    } = body;

    if (!userPhoto || typeof userPhoto !== 'string') {
      return NextResponse.json(
        { success: false, error: 'User photo is required.' },
        { status: 400 }
      );
    }

    // ── 1. Load user photo ──────────────────────────────────────────────────
    let userMimeType = 'image/jpeg';
    let userBase64 = '';

    if (userPhoto.startsWith('data:')) {
      const userMatch = userPhoto.match(/^data:([^;]+);base64,(.+)$/);
      if (!userMatch) {
        return NextResponse.json(
          { success: false, error: 'Invalid user photo format.' },
          { status: 400 }
        );
      }
      userMimeType = userMatch[1] || 'image/jpeg';
      userBase64 = userMatch[2];
    } else if (userPhoto.startsWith('/')) {
      const localPath = path.join(process.cwd(), 'public', userPhoto.replace(/^\//, ''));
      if (fs.existsSync(localPath)) {
        const fileBuffer = fs.readFileSync(localPath);
        userBase64 = fileBuffer.toString('base64');
        const ext = path.extname(localPath).toLowerCase();
        userMimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      } else {
        return NextResponse.json(
          { success: false, error: `User photo file not found at ${userPhoto}` },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported user photo format.' },
        { status: 400 }
      );
    }

    // ── 2. Load service account credentials (file OR environment variable) ──
    // On Vercel/serverless the filesystem is read-only, so we MUST support
    // loading credentials directly from the environment variable without
    // writing any file to disk.
    let saContent: Record<string, any> | null = null;

    // Priority 1: local service-account.json file (works in dev)
    const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      try {
        saContent = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        console.info('[Try-on API] Loaded credentials from service-account.json file.');
      } catch (e) {
        console.warn('[Try-on API] Failed to parse service-account.json:', e);
      }
    }

    // Priority 2: environment variable (works on Vercel / any serverless host)
    if (!saContent) {
      const envJson =
        process.env.VERTEX_SERVICE_ACCOUNT_JSON ||
        process.env.GOOGLE_SERVICE_ACCOUNT ||
        '';
      if (envJson) {
        try {
          saContent = JSON.parse(envJson);
          console.info('[Try-on API] Loaded credentials from environment variable.');
        } catch (e) {
          console.error('[Try-on API] Failed to parse service account env var as JSON:', e);
          return NextResponse.json(
            {
              success: false,
              error:
                'VERTEX_SERVICE_ACCOUNT_JSON environment variable contains invalid JSON. ' +
                'Please paste the full service-account.json content as a single-line JSON string.',
            },
            { status: 500 }
          );
        }
      }
    }

    if (!saContent) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Google Cloud credentials are not configured. ' +
            'Add VERTEX_SERVICE_ACCOUNT_JSON as an environment variable in your Vercel project settings.',
        },
        { status: 500 }
      );
    }

    // Fix escaped newlines in private_key (common when pasting JSON into env vars)
    if (saContent.private_key && typeof saContent.private_key === 'string') {
      saContent.private_key = saContent.private_key.replace(/\\n/g, '\n');
    }

    const projectId: string = saContent.project_id || 'apniapi';

    // ── 3. Get Google OAuth2 token (using credentials object, no file needed) ──
    const auth = new GoogleAuth({
      credentials: saContent,           // ← direct object, no keyFile path
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = typeof tokenResponse === 'string' ? tokenResponse : tokenResponse.token;

    if (!accessToken) {
      throw new Error('Failed to obtain Google Cloud OAuth2 access token.');
    }

    // ── 4. Load item image (product) ────────────────────────────────────────
    const itemImagePart = sareeImageUrl ? loadImagePart(sareeImageUrl) : null;
    if (itemImagePart) {
      console.info(`[Try-on API] Item image loaded for "${sareeName}" (${sareeCategory})`);
    } else {
      console.warn(`[Try-on API] WARNING: Could not load item image. sareeImageUrl="${sareeImageUrl}"`);
    }

    const hasItemImage = !!itemImagePart;
    const itemInstruction = buildItemInstruction(sareeCategory, sareeName);

    // ── 5. Build interleaved parts: text label → image → text label → image → instruction
    // This interleaved structure helps Gemini clearly understand which image is which.
    const parts: any[] = [];

    // Label for person photo
    parts.push({
      text: `SUBJECT PHOTO — This is the real person who will wear the fashion item:`,
    });
    // Person image
    parts.push({ inlineData: { mimeType: userMimeType, data: userBase64 } });

    if (hasItemImage) {
      // Label for item image
      parts.push({
        text: `FASHION ITEM REFERENCE — This is the exact "${sareeName}" (${sareeCategory}) that must be worn by the person above:`,
      });
      // Item / product image
      parts.push({ inlineData: itemImagePart! });
    }

    // Final instruction prompt
    const promptText = `TASK — VIRTUAL TRY-ON:

Generate a single, photorealistic photograph of the SUBJECT PERSON (shown in the first image above) wearing the FASHION ITEM (shown in the second image above).

ITEM PLACEMENT INSTRUCTIONS:
${itemInstruction}

MANDATORY RULES:
1. PERSON: The output must show the EXACT same person from the subject photo — same face, skin tone, hair, body shape, and pose. Do NOT change who the person is.
2. ITEM: The fashion item in the output must look EXACTLY like the reference image — same colour, pattern, fabric, embroidery, cut, and every detail. Do NOT invent or simplify the design.
3. REALISTIC: The result must look like a real photograph — natural lighting, realistic fabric draping, no collage artifacts.
4. BACKGROUND: Retain the background from the subject photo or use a clean studio background.
5. OUTPUT: Generate ONLY the final try-on photograph. Do NOT return the product image alone. Do NOT return the subject photo unchanged. Do NOT add text, labels, or watermarks.
6. COMPOSITE: The output MUST be a NEW image of the person wearing the item — this is non-negotiable for this fashion app.

Generate the try-on photograph now.`;

    parts.push({ text: promptText });

    const totalImages = parts.filter((p) => p.inlineData).length;
    console.info(`[Try-on API] Sending to Gemini → ${totalImages} image(s) + interleaved prompt | "${sareeName}" | category: "${sareeCategory}"`);

    // ── 6. Call Gemini via Google Agent Platform ────────────────────────────
    const modelId = 'gemini-3.1-flash-image';
    const hostname = 'aiplatform.googleapis.com';
    const urlPath = `/v1/projects/${projectId}/locations/global/publishers/google/models/${modelId}:generateContent`;

    const postBody = JSON.stringify({
      contents: [{ role: 'user', parts }],
      generation_config: { response_modalities: ['TEXT', 'IMAGE'] },
    });

    const data: any = await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        httpReq.destroy(new Error('Request timeout after 55s'));
      }, 55000);

      const httpReq = https.request(
        {
          hostname,
          path: urlPath,
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postBody),
          },
          family: 4, // Force IPv4
        },
        (res) => {
          let rawData = '';
          res.on('data', (chunk) => { rawData += chunk; });
          res.on('end', () => {
            clearTimeout(timeoutId);
            try {
              resolve({ statusCode: res.statusCode, body: JSON.parse(rawData) });
            } catch {
              resolve({ statusCode: res.statusCode, body: {}, raw: rawData.substring(0, 500) });
            }
          });
        }
      );

      httpReq.on('error', (err) => {
        clearTimeout(timeoutId);
        reject(err);
      });

      httpReq.write(postBody);
      httpReq.end();
    });

    // ── 7. Extract generated image from response ────────────────────────────
    if (data.statusCode === 200 && data.body?.candidates?.[0]?.content?.parts) {
      for (const part of data.body.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          const generatedUrl = `data:${mime};base64,${part.inlineData.data}`;
          console.info(`[Try-on API] ✅ Try-on image generated successfully! Size: ${part.inlineData.data.length} chars.`);
          return NextResponse.json({
            success: true,
            image: generatedUrl,
            source: 'gemini-3.1-flash-image',
          });
        }
      }

      // Response came back 200 but only has text (model refused or returned description)
      const textParts = data.body.candidates[0].content.parts
        .filter((p: any) => p.text)
        .map((p: any) => p.text)
        .join(' ');
      console.warn('[Try-on API] Model returned text instead of image:', textParts.substring(0, 300));
      return NextResponse.json(
        {
          success: false,
          error: `AI model returned a description instead of an image. Response: ${textParts.substring(0, 200)}`,
          status: 'TEXT_ONLY_RESPONSE',
        },
        { status: 422 }
      );
    }

    // Non-200 error from Google Cloud
    const rawError = data.body?.error?.message || `Google Cloud returned HTTP ${data.statusCode}`;
    console.error('[Try-on API] Google Cloud error:', rawError, data.raw || '');

    return NextResponse.json(
      {
        success: false,
        error: `Google Cloud Error: ${rawError}`,
        status: data.body?.error?.status || 'AGENT_PLATFORM_ERROR',
        code: data.body?.error?.code || data.statusCode,
      },
      { status: data.statusCode >= 400 ? data.statusCode : 502 }
    );
  } catch (error: any) {
    const rawMsg = error instanceof Error ? error.message : String(error);
    console.error('[Try-on API Error]:', rawMsg);
    return NextResponse.json(
      {
        success: false,
        error: `Generation Service Error: ${rawMsg}`,
      },
      { status: 502 }
    );
  }
}

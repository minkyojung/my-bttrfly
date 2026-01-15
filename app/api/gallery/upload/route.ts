import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';

interface PhotoMetadata {
  date?: string;
  location?: string;
  camera?: string;
  description?: string;
}

const galleryDirectory = path.join(process.cwd(), 'public/images/gallery');
const metadataFile = path.join(galleryDirectory, 'metadata.json');

async function loadMetadata(): Promise<Record<string, PhotoMetadata>> {
  try {
    const content = await readFile(metadataFile, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function saveMetadata(data: Record<string, PhotoMetadata>): Promise<void> {
  await writeFile(metadataFile, JSON.stringify(data, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Ensure gallery directory exists
    await mkdir(galleryDirectory, { recursive: true });

    // Load existing metadata
    const existingMetadata = await loadMetadata();

    // Process each file
    const entries = Array.from(formData.entries());
    const fileEntries = entries.filter(([key]) => key.startsWith('file-'));

    for (const [key, value] of fileEntries) {
      if (!(value instanceof File)) continue;

      const index = key.replace('file-', '');
      const metadataKey = `metadata-${index}`;
      const metadataValue = formData.get(metadataKey);

      const file = value;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const ext = path.extname(file.name);
      const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
      const timestamp = Date.now();
      const filename = `${baseName}_${timestamp}${ext}`;

      // Save file
      const filePath = path.join(galleryDirectory, filename);
      await writeFile(filePath, buffer);

      // Save metadata
      if (metadataValue && typeof metadataValue === 'string') {
        try {
          const metadata = JSON.parse(metadataValue) as PhotoMetadata;
          existingMetadata[filename] = metadata;
        } catch {
          // Skip invalid metadata
        }
      }
    }

    // Save updated metadata
    await saveMetadata(existingMetadata);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

/** Which files each editor input is allowed to accept. `accept` on the input is only a hint. */
export type FileKind = 'image' | 'pdf' | 'video' | 'model';

export const FILE_ACCEPT: Record<FileKind, string> = {
    image: '.jpg,.jpeg,.png,.gif,.webp,.bmp,.avif,.heic,.heif,.svg,.tif,.tiff,image/jpeg,image/png,image/gif,image/webp,image/bmp,image/avif,image/heic,image/heif,image/svg+xml,image/tiff',
    pdf: '.pdf,application/pdf',
    video: 'video/*,.mp4,.webm,.ogg,.ogv,.mov,.m4v,.avi,.mkv,.mpeg,.mpg,.wmv',
    model: '.obj,.gltf,.glb'
};

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'avif', 'heic', 'heif', 'svg', 'tif', 'tiff']);
const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'ogg', 'ogv', 'mov', 'm4v', 'avi', 'mkv', 'mpeg', 'mpg', 'wmv']);
const MODEL_EXTENSIONS = new Set(['obj', 'gltf', 'glb']);

const KIND_LABEL: Record<FileKind, string> = {
    image: 'slike (JPG, PNG, WEBP, GIF, SVG)',
    pdf: 'PDF datoteke',
    video: 'videozapisi (MP4, WEBM, MOV, AVI)',
    model: '3D modeli (.obj, .gltf, .glb)'
};

function extensionOf(filename: string): string {
    const base = filename.split(/[/\\]/).pop() ?? filename;
    const dot = base.lastIndexOf('.');
    if (dot <= 0) return '';
    return base.slice(dot + 1).toLowerCase();
}

function isGenericMime(type: string): boolean {
    return type === '' || type === 'application/octet-stream';
}

/** True when the extension and, when the browser knows it, the MIME type match this field. */
export function isAllowedFile(file: File, kind: FileKind): boolean {
    const extension = extensionOf(file.name);
    const type = (file.type || '').toLowerCase();

    switch (kind) {
        case 'image':
            if (type.startsWith('image/')) return extension === '' || IMAGE_EXTENSIONS.has(extension);
            return isGenericMime(type) && IMAGE_EXTENSIONS.has(extension);
        case 'pdf':
            if (extension !== 'pdf') return false;
            return isGenericMime(type) || type === 'application/pdf' || type === 'application/x-pdf';
        case 'video':
            if (type.startsWith('video/')) return extension === '' || VIDEO_EXTENSIONS.has(extension);
            return isGenericMime(type) && VIDEO_EXTENSIONS.has(extension);
        case 'model':
            if (!MODEL_EXTENSIONS.has(extension)) return false;
            return isGenericMime(type) || type.startsWith('model/') || type === 'text/plain' || type === 'application/json';
    }
}

export function invalidFilesMessage(names: string[], kind: FileKind): string {
    const list = names.map(name => `- ${name}`).join('\n');
    return `Sljedeće datoteke nisu dodane jer format nije dozvoljen:\n\n${list}\n\nDozvoljene su samo ${KIND_LABEL[kind]}.`;
}

/**
 * Copies the bytes out of the input. The browser can drop the original File once the
 * input is cleared or the control is redrawn, which later uploads as an empty file.
 */
export async function copyFile(file: File): Promise<File> {
    const bytes = await file.arrayBuffer();
    if (bytes.byteLength === 0) {
        throw new Error('empty');
    }
    return new File([bytes], file.name, {type: file.type, lastModified: file.lastModified});
}

import 'preact';

/** Lets TypeScript accept the <model-viewer> element from @google/model-viewer. */
declare module 'preact' {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': any;
        }
    }
}

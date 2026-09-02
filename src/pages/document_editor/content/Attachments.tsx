import {getDownloadUrl} from "../../../util/Utilities.ts";
import {IconCheck, IconDownload, IconPDF, IconVideo} from "../../../assets/Icons.tsx";
import {useEffect, useState} from "preact/hooks";
import Lightbox from "yet-another-react-lightbox";
import {Zoom} from "yet-another-react-lightbox/plugins";
import "yet-another-react-lightbox/styles.css";
import '@google/model-viewer';
import type {useDocumentFiles} from "../useDocumentEditor.ts";

export function AttachmentsSection({ fileManager }: { fileManager: ReturnType<typeof useDocumentFiles> }) {
    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-2">Multimedija i prilozi</h2>

            <PdfSection
                pdfFile={fileManager.files.pdf}
                serverPdf={fileManager.serverPaths.pdf}
                onChange={fileManager.handleSingleFileChange('pdf')}
                onRemove={fileManager.handleRemovePdf}
            />

            <PhotosSection
                files={fileManager.files}
                serverPaths={fileManager.serverPaths}
                onMultipleFilesChange={fileManager.handleMultipleFilesChange('projectPhotos')}
                onUpdateFileName={fileManager.handleUpdateFileName}
                onUpdateServerPhotoName={fileManager.handleUpdateServerPhotoName}
                onRemoveFile={fileManager.handleRemoveFile}
                onRemoveServerPhoto={fileManager.handleRemoveServerPhoto}
            />

            <Models3DSection
                files={fileManager.files}
                serverPaths={fileManager.serverPaths}
                onMultipleFilesChange={fileManager.handleMultipleFilesChange('models3d')}
                onUpdateFileName={fileManager.handleUpdateFileName}
                onUpdateServerModelName={fileManager.handleUpdateServerModelName}
                onRemoveFile={fileManager.handleRemoveFile}
                onRemoveServerModel={fileManager.handleRemoveServerModel}
            />

            <VideoSection
                videoFile={fileManager.files.video}
                serverVideo={fileManager.serverPaths.video}
                onChange={fileManager.handleSingleFileChange('video')}
                onUpdateVideoName={fileManager.handleUpdateVideoName}
                onRemoveVideo={fileManager.handleRemoveVideo}
            />
        </div>
    );
}

export function PdfSection({ pdfFile, serverPdf, onChange, onRemove }: any) {
    return (
        <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">
                Glavni Dokument (PDF) <span className="text-red-500">*</span>
            </h2>

            {/* Increased padding and added gap for a less cramped layout */}
            <div className="border border-slate-200 rounded-md p-8 bg-slate-50 flex flex-col gap-6">

                {serverPdf && !pdfFile && (
                    <div className="flex items-center">
                        <a
                            href={getDownloadUrl(serverPdf)}
                            target="_blank"
                            className="flex items-center gap-2.5 text-base text-blue-700 font-medium hover:text-blue-900 transition-colors group"
                        >
                            <IconPDF />
                            <span className="group-hover:underline">Preuzmi trenutni PDF</span>
                            <IconDownload />
                        </a>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-4">
                    <label className="cursor-pointer inline-flex items-center bg-white border border-slate-300 text-slate-700 font-medium text-base py-2.5 px-6 rounded-md hover:bg-slate-100 hover:border-slate-400 transition-colors shadow-sm">
                        Odaberi PDF
                        <input type="file" accept=".pdf" className="hidden" onChange={onChange} />
                    </label>

                    {(serverPdf || pdfFile) && (
                        <button
                            type="button"
                            onClick={onRemove}
                            className="text-red-600 hover:bg-red-50 border border-slate-300 hover:border-red-200 font-medium text-base py-2.5 px-6 rounded-md transition-colors shadow-sm"
                        >
                            Ukloni PDF
                        </button>
                    )}
                </div>

                {pdfFile && (
                    <div className="flex items-center gap-3 text-base text-emerald-800 font-medium bg-emerald-50 p-4 rounded-md border border-emerald-200">
                        <IconCheck />
                        <span>Pripremljeno za prijenos: <span className="font-bold">{pdfFile.name}</span></span>
                    </div>
                )}
            </div>
        </section>
    );
}

export function PhotosSection({ files, serverPaths, onMultipleFilesChange, onUpdateFileName, onUpdateServerPhotoName, onRemoveFile, onRemoveServerPhoto }: any) {
    const ITEMS_PER_PAGE = 3;

    const [lightboxIndex, setLightboxIndex] = useState(-1);
    const [photoPage, setPhotoPage] = useState(0);

    const totalPages = Math.ceil(serverPaths.projectPhotos.length / ITEMS_PER_PAGE);
    const lightboxSlides = serverPaths.projectPhotos.map((photo: any) => ({
        src: getDownloadUrl(photo.path), alt: photo.name,
    }));

    return (
        <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Fotografije projekta</h2>

            {serverPaths.projectPhotos.length > 0 && (
                <div className="flex flex-col mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <Lightbox open={lightboxIndex >= 0} close={() => setLightboxIndex(-1)} index={lightboxIndex} slides={lightboxSlides} plugins={[Zoom]} />

                    <div className="overflow-hidden w-full mb-6">
                        <div className="flex transition-transform duration-500 ease-in-out" style={{transform: `translateX(-${photoPage * 100}%)`}}>
                            {serverPaths.projectPhotos.map((photo: any, index: number) => (
                                <div key={index} className="w-full md:w-1/3 flex-shrink-0 px-2">
                                    <div className="flex flex-col bg-white border border-slate-300 rounded shadow-sm overflow-hidden h-full">
                                        <div className="relative group cursor-pointer aspect-[4/3] bg-black overflow-hidden" onClick={() => setLightboxIndex(index)}>
                                            <img src={getDownloadUrl(photo.path)} alt="preview" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                        </div>
                                        <div className="p-2 border-t border-slate-200 flex-1 flex flex-col">
                                            <textarea
                                                value={photo.name}
                                                onChange={(e) => onUpdateServerPhotoName(index, (e.target as HTMLTextAreaElement).value)}
                                                className="w-full text-sm font-medium text-slate-700 bg-transparent resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1 flex-1 mb-2"
                                                rows={2} placeholder="Unesite naziv"
                                            />
                                            <button
                                                onClick={() => onRemoveServerPhoto(index)}
                                                className="text-red-500 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-xs px-2 py-1 rounded transition-colors font-medium self-end"
                                            >
                                                Ukloni
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-6">
                            <button onClick={() => setPhotoPage(p => Math.max(0, p - 1))} disabled={photoPage === 0} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-colors">
                                <span className="text-xl font-bold">←</span>
                            </button>
                            <div className="flex gap-2">
                                {Array.from({length: totalPages}).map((_, idx) => (
                                    <div key={idx} onClick={() => setPhotoPage(idx)} className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors ${idx === photoPage ? 'bg-blue-600' : 'bg-slate-300 hover:bg-slate-400'}`} />
                                ))}
                            </div>
                            <button onClick={() => setPhotoPage(p => Math.min(totalPages - 1, p + 1))} disabled={photoPage === totalPages - 1} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-colors">
                                <span className="text-xl font-bold">→</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {files.projectPhotos.map((item: any, index: number) => (
                <div key={index} className="flex gap-4 mb-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
                    <img src={item.previewUrl} alt="preview" className="w-24 h-24 object-cover rounded border border-slate-300 shadow-sm"/>
                    <div className="flex-1 flex flex-col justify-between">
                        <textarea
                            value={item.name}
                            placeholder="Unesite opisni naziv fotografije (u više linija)"
                            onChange={(e) => onUpdateFileName('projectPhotos', index, (e.target as HTMLTextAreaElement).value)}
                            className="w-full text-sm px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 resize-none h-16"
                        />
                        <div className="flex justify-between items-end mt-1">
                            <span className="text-xs text-slate-500 truncate max-w-[200px]">{item.file.name}</span>
                            <button onClick={() => onRemoveFile('projectPhotos', index)} className="text-red-500 hover:bg-red-100 text-sm px-3 py-1 rounded transition-colors font-medium">Ukloni</button>
                        </div>
                    </div>
                </div>
            ))}

            <label className="cursor-pointer inline-block bg-white border border-slate-300 text-slate-700 font-medium text-sm py-2 px-4 rounded hover:bg-slate-50 mt-2">
                + Dodaj nove fotografije
                <input type="file" accept="image/*" multiple className="hidden" onChange={onMultipleFilesChange}/>
            </label>
        </section>
    );
}

export function Models3DSection({ files, serverPaths, onMultipleFilesChange, onUpdateFileName, onUpdateServerModelName, onRemoveFile, onRemoveServerModel }: any) {
    const [modelPage, setModelPage] = useState(0);

    const allModels = [
        ...serverPaths.models3d.map((m: any, i: number) => ({isServer: true, data: m, index: i})),
        ...files.models3d.map((m: any, i: number) => ({isServer: false, data: m, index: i}))
    ];
    const totalModels = allModels.length;
    const currentModel = allModels[modelPage];

    useEffect(() => {
        if (modelPage >= totalModels && totalModels > 0) {
            setModelPage(totalModels - 1);
        } else if (totalModels === 0) {
            setModelPage(0);
        }
    }, [totalModels, modelPage]);

    const isModelFormatSupported = (filename: string) => {
        const lowerCaseName = filename.toLowerCase();
        return lowerCaseName.endsWith('.glb') || lowerCaseName.endsWith('.gltf');
    };

    const currentModelFilename = currentModel ? (currentModel.isServer ? currentModel.data.path : currentModel.data.file.name) : '';
    const isModelSupported = isModelFormatSupported(currentModelFilename);

    return (
        <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">3D Modeli</h2>

            {totalModels > 0 && (
                <div className="flex flex-col mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">

                    <div className="flex flex-col bg-white border border-slate-300 rounded shadow-sm overflow-hidden mb-4">

                        <div className="w-full h-[400px] bg-slate-200 relative flex items-center justify-center overflow-hidden">
                            {currentModel && (
                                isModelSupported ? (
                                    <model-viewer
                                        src={currentModel.isServer ? getDownloadUrl(currentModel.data.path) : currentModel.data.previewUrl}
                                        alt={currentModel.data.name}
                                        auto-rotate
                                        camera-controls
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            backgroundColor: '#f1f5f9',
                                            cursor: 'grab'
                                        }}
                                    ></model-viewer>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-slate-500 w-full h-full text-center p-6">
                                        <span className="text-4xl mb-3">🧊</span>
                                        <p className="font-semibold text-lg text-slate-700">Format nije podržan za pregled</p>
                                        <p className="text-sm mt-1">Samo .glb i .gltf formati mogu biti prikazani u pregledniku.</p>
                                        <p className="text-xs mt-2 bg-white px-2 py-1 rounded border border-slate-300">
                                            {currentModelFilename.split('/').pop()}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Editor Controls */}
                        {currentModel && (
                            <div className="p-4 flex flex-col gap-3">
                                <textarea
                                    value={currentModel.data.name}
                                    onChange={(e) => {
                                        if (currentModel.isServer) {
                                            onUpdateServerModelName(currentModel.index, (e.target as HTMLTextAreaElement).value);
                                        } else {
                                            onUpdateFileName('models3d', currentModel.index, (e.target as HTMLTextAreaElement).value);
                                        }
                                    }}
                                    className="w-full text-sm font-medium text-slate-700 bg-slate-50 border border-slate-300 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-3"
                                    rows={2}
                                    placeholder="Unesite naziv modela"
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex gap-4">
                                        {currentModel.isServer ? (
                                            <a href={getDownloadUrl(currentModel.data.path)} target="_blank"
                                               className="text-blue-700 hover:underline font-bold text-sm flex items-center gap-1">
                                                <span>↓</span> Preuzmi datoteku
                                            </a>
                                        ) : (
                                            <span className="text-xs font-medium text-slate-500">Nova datoteka spremna za prijenos: {currentModel.data.file.name}</span>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (currentModel.isServer) {
                                                onRemoveServerModel(currentModel.index);
                                            } else {
                                                onRemoveFile('models3d', currentModel.index);
                                            }
                                        }}
                                        className="text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 font-bold px-4 py-1.5 rounded text-sm transition-all"
                                    >
                                        Ukloni model
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalModels > 1 && (
                        <div className="flex items-center justify-center gap-6 mt-2">
                            <button type="button"
                                    onClick={() => setModelPage(p => Math.max(0, p - 1))}
                                    disabled={modelPage === 0}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-colors">
                                <span className="text-xl font-bold">←</span>
                            </button>

                            <div className="flex gap-2">
                                {Array.from({length: totalModels}).map((_, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setModelPage(idx)}
                                        className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors ${idx === modelPage ? 'bg-blue-600' : 'bg-slate-300 hover:bg-slate-400'}`}
                                    />
                                ))}
                            </div>
                            <button type="button"
                                    onClick={() => setModelPage(p => Math.min(totalModels - 1, p + 1))}
                                    disabled={modelPage === totalModels - 1}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-colors">
                                <span className="text-xl font-bold">→</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            <label className="cursor-pointer inline-block bg-white border border-slate-300 text-slate-700 font-medium text-sm py-2 px-4 rounded hover:bg-slate-50 mt-2">
                + Dodaj nove modele
                <input type="file" accept=".obj,.gltf,.glb" multiple className="hidden"
                       onChange={onMultipleFilesChange}/>
            </label>
        </section>
    );
}

export function VideoSection({ videoFile, serverVideo, onChange, onUpdateVideoName, onRemoveVideo }: any) {
    return (
        <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Videozapis</h2>

            {(serverVideo || videoFile) ? (
                <div className="flex flex-col mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex flex-col bg-white border border-slate-300 rounded shadow-sm overflow-hidden mb-4">
                        <div className="w-full bg-slate-200 relative flex items-center justify-center overflow-hidden">
                            <video src={serverVideo ? getDownloadUrl(serverVideo.path) : videoFile!.previewUrl} controls className="w-full h-auto max-h-[450px] bg-black">
                                Vaš preglednik ne podržava video element.
                            </video>
                        </div>

                        <div className="p-4 flex flex-col gap-3">
                            <textarea
                                value={serverVideo ? serverVideo.name : videoFile!.name}
                                onChange={(e) => onUpdateVideoName((e.target as HTMLTextAreaElement).value, !!serverVideo)}
                                className="w-full text-sm font-medium text-slate-700 bg-slate-50 border border-slate-300 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-3"
                                rows={2} placeholder="Unesite naziv videozapisa"
                            />

                            <div className="flex justify-between items-center mt-2">
                                <div className="flex gap-4">
                                    {serverVideo ? (
                                        <a href={getDownloadUrl(serverVideo.path)} target="_blank" className="text-blue-700 hover:underline font-bold text-sm flex items-center gap-1"><span>↓</span> Preuzmi datoteku</a>
                                    ) : (
                                        <span className="text-xs font-medium text-slate-500">Nova datoteka spremna za prijenos: {videoFile!.file.name}</span>
                                    )}
                                </div>
                                <button onClick={() => onRemoveVideo(!!serverVideo)} className="text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 font-bold px-4 py-1.5 rounded text-sm transition-all">
                                    Ukloni video
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-md p-8 bg-slate-50 flex flex-col items-center justify-center transition-colors hover:bg-slate-100">
                    <IconVideo />
                    <p className="text-sm text-slate-600 mb-4">Ovdje možete priložiti videozapis o projektu.</p>
                    <label className="cursor-pointer inline-block bg-white border border-slate-300 text-slate-700 font-medium text-sm py-2 px-6 rounded-md hover:border-blue-500 transition-colors shadow-sm">
                        Odaberi video
                        <input type="file" accept="video/*" className="hidden" onChange={onChange}/>
                    </label>
                </div>
            )}
        </section>
    );
}

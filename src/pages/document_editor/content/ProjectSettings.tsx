import {getDownloadUrl} from "../../../util/Utilities.ts";
import {IconGlobe, IconImageAdd, IconImageEdit, IconInstitution, IconTrash, IconUsers} from "../../../assets/Icons.tsx";
import {Visibility} from "../../../data/types/Document.ts";
import {UserSelector} from "./components/UserSelector.tsx";

interface CoverPhotoProps {
    coverFile: File | null;
    serverCover: string;
    coverPreviewUrl: string | null;
    onChange: (e: Event) => void;
    onRemove: () => void;
}


export function ProjectSettings({ metadata, fileManager }: any) {
    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-2">Postavke projekta</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VisibilitySection
                    visibility={metadata.visibility}
                    onChange={metadata.setVisibility}
                />

                <CoverPhotoSection
                    coverFile={fileManager.files.cover}
                    serverCover={fileManager.serverPaths.cover}
                    coverPreviewUrl={fileManager.coverPreviewUrl}
                    onChange={fileManager.handleSingleFileChange('cover')}
                    onRemove={fileManager.handleRemoveCover}
                />
            </div>

            {/* Co-creator Selector (Students) */}
            <UserSelector
                title="Koautori projekta (Studenti)"
                icon={<IconUsers />}
                selectedUsers={metadata.coCreators}
                onAddUser={metadata.handleAddCoCreator}
                onRemoveUser={metadata.handleRemoveCoCreator}
                isProfessorOnly={false}
                placeholder="Pretraži studente po imenu ili email adresi..."
                emptyText="Nema pronađenih studenata"
            />

            {/* Mentors Selector (Professors) */}
            <UserSelector
                title="Mentori projekta (Profesori)"
                icon={<IconUsers />}
                selectedUsers={metadata.mentors}
                onAddUser={metadata.handleAddMentor}
                onRemoveUser={metadata.handleRemoveMentor}
                isProfessorOnly={true}
                placeholder="Pretraži profesore po imenu ili email adresi..."
                emptyText="Nema pronađenih profesora"
                isRequired={true}
            />
        </div>
    );
}

export function VisibilitySection({ visibility, onChange }: { visibility: Visibility, onChange: (val: Visibility) => void }) {
    return (
        <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col h-full relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-slate-50 rounded-full blur-2xl opacity-60 pointer-events-none"></div>

            <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
                <span>Vidljivost projekta</span>
            </h2>

            <div className="flex flex-col gap-3 flex-grow justify-center relative z-10">
                <button
                    type="button"
                    onClick={() => onChange(Visibility.PUBLIC)}
                    className={`flex items-center text-left gap-4 p-4 border rounded-lg transition-all duration-200 group ${
                        visibility === Visibility.PUBLIC
                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-md transform scale-[1.02]'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white hover:shadow-sm'
                    }`}
                >
                    <div className={`p-2 rounded-full flex items-center justify-center transition-colors ${
                        visibility === Visibility.PUBLIC ? 'bg-blue-100' : 'bg-slate-200'
                    }`}>
                        <IconGlobe className={`transition-colors ${
                            visibility === Visibility.PUBLIC ? 'w-6 h-6 text-blue-600' : 'w-6 h-6 text-slate-400 group-hover:text-slate-500'
                        }`} />
                    </div>
                    <div>
                        <span className={`font-bold text-sm block ${visibility === Visibility.PUBLIC ? 'text-blue-900' : 'text-slate-600'}`}>Javno (Public)</span>
                        <span className={`text-xs opacity-90 ${visibility === Visibility.PUBLIC ? 'text-blue-900' : 'text-slate-600'}`}>Vidljivo svim posjetiteljima platforme.</span>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => onChange(Visibility.OKIRU)}
                    className={`flex items-center text-left gap-4 p-4 border rounded-lg transition-all duration-200 group ${
                        visibility === Visibility.OKIRU
                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-md transform scale-[1.02]'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white hover:shadow-sm'
                    }`}
                >
                    <div className={`p-2 rounded-full flex items-center justify-center transition-colors ${
                        visibility === Visibility.OKIRU ? 'bg-blue-100' : 'bg-slate-200'
                    }`}>
                        <IconInstitution className={`transition-colors ${
                            visibility === Visibility.OKIRU ? 'w-6 h-6 text-blue-600' : 'w-6 h-6 text-slate-400 group-hover:text-slate-500'
                        }`} />
                    </div>
                    <div>
                        <span className={`font-bold text-sm block ${visibility === Visibility.OKIRU ? 'text-blue-900' : 'text-slate-600'}`}>Interno (OKIRU)</span>
                        <span className={`text-xs opacity-90 ${visibility === Visibility.OKIRU ? 'text-blue-900' : 'text-slate-600'}`}>Vidljivo isključivo prijavljenim korisnicima.</span>
                    </div>
                </button>
            </div>
        </section>
    );
}

export function CoverPhotoSection({ serverCover, coverPreviewUrl, onChange, onRemove }: CoverPhotoProps) {
    const hasImage = !!(coverPreviewUrl || serverCover);

    return (
        <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col h-full">
            <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
                Naslovna fotografija
            </h2>

            <div className="flex flex-col flex-grow justify-center w-full">
                <label className="relative group cursor-pointer block w-full max-w-[200px] mx-auto aspect-square rounded-xl overflow-hidden border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 transition-all duration-300 shadow-inner">

                    {hasImage ? (
                        <>
                            <img
                                src={coverPreviewUrl ? coverPreviewUrl : getDownloadUrl(serverCover)}
                                alt="Naslovna"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />

                            <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white">
                                <IconImageEdit className="w-8 h-8 text-white mb-2 drop-shadow-md" />
                                <span className="text-sm font-semibold drop-shadow-md">Promijeni</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 group-hover:text-blue-500 transition-colors">
                            <IconImageAdd className="w-10 h-10 text-slate-400 group-hover:text-blue-500 transition-colors mb-2" />
                            <span className="text-sm font-medium text-center px-4 group-hover:text-blue-500">Kliknite za odabir</span>
                        </div>
                    )}

                    <input type="file" accept="image/*" className="hidden" onChange={onChange} />
                </label>

                <div className="flex justify-between items-center mt-5">

                    {hasImage && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onRemove();
                            }}
                            className="group flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 py-1.5 px-3 rounded-md transition-all"
                            title="Ukloni sliku"
                        >
                            <IconTrash className="w-4 h-4 text-slate-500 group-hover:text-red-600 transition-colors" />
                            <span>Obriši</span>
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
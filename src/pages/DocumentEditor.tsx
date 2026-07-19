import { useState } from 'preact/hooks';

const CATEGORIES = [
    "", // Empty default option
    "DRVENI PREDMETI", "SLIKE NA PLATNU", "ZIDNE SLIKE",
    "KAMENA I ARHITEKTONSKA PLASTIKA", "OSTALI MATERIJALI",
    "REFERENTNA ISTRAŽIVANJA", "DIPLOMSKI I SEMINARSKI RADOVI"
];

export function DocumentEditor() {
    // Form state matching the DocumentContent data class
    const [formData, setFormData] = useState({
        category: '',
        invNumber: '',
        name: '',
        author: '',
        date: '',
        student: '',
        professor: '',
        material: '',
        technique: '',
        pigment: '',
        binder: '',
        finishingLayer: '',
        materialsUsed: '',
        typeOfAnalysis: '',
        goalOfAnalysis: '',
        works: '',
        keywords: '',
        location: '',
        storage: ''
    });

    // Mock state for file uploads (UI only for now)
    const [files, setFiles] = useState({
        cover: false,
        pdf: false,
        model3d: false
    });

    const handleInputChange = (e: Event) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        setFormData(prev => ({
            ...prev,
            [target.name]: target.value
        }));
    };

    const handleFileChange = (type: 'cover' | 'pdf' | 'model3d') => (e: Event) => {
        const target = e.target as HTMLInputElement;
        setFiles(prev => ({
            ...prev,
            [type]: !!(target.files && target.files.length > 0)
        }));
    };

    // Validation logic for the Publish button
    const isFormFilled = Object.values(formData).every(value => value.trim() !== '');
    const isPublishable = isFormFilled && files.pdf;

    return (
        <div className="w-full flex flex-col items-center pb-16 bg-slate-50 min-h-screen">

            {/* Top Action Bar */}
            <div className="w-full max-w-5xl flex items-center justify-between mt-8 mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Novi dokument</h1>
                    <p className="text-sm text-slate-500 mt-1">Unos novog restauratorskog projekta u bazu</p>
                </div>
                <button className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-md hover:bg-slate-50 hover:text-blue-900 transition-colors shadow-sm">
                    Spremi nacrt
                </button>
            </div>

            <div className="w-full max-w-5xl flex flex-col gap-6">

                {/* Section 1: Osnovni podaci */}
                <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Identifikacija i opći podaci</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kategorija</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat || "— Odaberite kategoriju —"}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Broj OKIRU</label>
                            <input type="text" name="invNumber" value={formData.invNumber} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Naslov / Naziv predmeta</label>
                            <input type="text" name="name" value={formData.name} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Autor</label>
                            <input type="text" name="author" value={formData.author} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Datacija</label>
                            <input type="text" name="date" value={formData.date} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Student</label>
                            <input type="text" name="student" value={formData.student} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Profesor / Mentor</label>
                            <input type="text" name="professor" value={formData.professor} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                    </div>
                </section>

                {/* Section 2: Materijali i tehnika */}
                <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Tehnološki podaci</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Osnovni materijal</label>
                            <input type="text" name="material" value={formData.material} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tehnika</label>
                            <input type="text" name="technique" value={formData.technique} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pigment</label>
                            <input type="text" name="pigment" value={formData.pigment} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vezivo</label>
                            <input type="text" name="binder" value={formData.binder} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Završni sloj</label>
                            <input type="text" name="finishingLayer" value={formData.finishingLayer} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Korišteni materijali (Zahvat)</label>
                            <input type="text" name="materialsUsed" value={formData.materialsUsed} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                    </div>
                </section>

                {/* Section 3: Analiza i zahvati */}
                <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Analize i provedeni radovi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vrsta analize</label>
                            <input type="text" name="typeOfAnalysis" value={formData.typeOfAnalysis} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cilj analize</label>
                            <input type="text" name="goalOfAnalysis" value={formData.goalOfAnalysis} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Provedeni radovi</label>
                            <textarea name="works" value={formData.works} onInput={handleInputChange} rows={3} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 resize-none"></textarea>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ključne riječi</label>
                            <input type="text" name="keywords" value={formData.keywords} onInput={handleInputChange} placeholder="Odvojite zarezom (npr. drvo, polikromija, 18. stoljeće)" className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                    </div>
                </section>

                {/* Section 4: Lokacija */}
                <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-blue-900 mb-6 border-b border-slate-100 pb-2">Smještaj i pohrana</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Izvorna lokacija</label>
                            <input type="text" name="location" value={formData.location} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mjesto pohrane / Depo</label>
                            <input type="text" name="storage" value={formData.storage} onInput={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 transition-all focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
                        </div>
                    </div>
                </section>

                {/* Section 5: Prilozi i dokumentacija */}
                <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
                        <h2 className="text-lg font-bold text-blue-900">Multimedija i privitci</h2>
                        <a href="#" className="text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1">
                            <span>↓</span> Preuzmi DOCX predložak
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Cover Photo */}
                        <div className="border border-dashed border-slate-300 rounded-md p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
                            <span className="text-3xl mb-2">📸</span>
                            <span className="text-sm font-semibold text-slate-700 mb-1">Naslovna fotografija</span>
                            <label className="mt-3 cursor-pointer bg-white border border-slate-300 text-slate-600 text-xs py-1.5 px-3 rounded hover:bg-slate-100 transition-colors">
                                Odaberi sliku
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange('cover')} />
                            </label>
                            {files.cover && <span className="text-xs text-green-600 mt-2 font-medium">✓ Slika dodana</span>}
                        </div>

                        {/* PDF Upload */}
                        <div className="border border-dashed border-slate-300 rounded-md p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
                            <span className="text-3xl mb-2">📄</span>
                            <span className="text-sm font-semibold text-slate-700 mb-1">Dokumentacija (PDF) <span className="text-red-500">*</span></span>
                            <label className="mt-3 cursor-pointer bg-white border border-slate-300 text-slate-600 text-xs py-1.5 px-3 rounded hover:bg-slate-100 transition-colors">
                                Odaberi PDF
                                <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange('pdf')} />
                            </label>
                            {files.pdf && <span className="text-xs text-green-600 mt-2 font-medium">✓ PDF dodan</span>}
                        </div>

                        {/* 3D Model Upload */}
                        <div className="border border-dashed border-slate-300 rounded-md p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
                            <span className="text-3xl mb-2">🧊</span>
                            <span className="text-sm font-semibold text-slate-700 mb-1">3D Model (Opcijonalno)</span>
                            <label className="mt-3 cursor-pointer bg-white border border-slate-300 text-slate-600 text-xs py-1.5 px-3 rounded hover:bg-slate-100 transition-colors">
                                Odaberi datoteku
                                <input type="file" accept=".obj,.gltf,.glb" className="hidden" onChange={handleFileChange('model3d')} />
                            </label>
                            {files.model3d && <span className="text-xs text-green-600 mt-2 font-medium">✓ Model dodan</span>}
                        </div>
                    </div>
                </section>

                {/* Bottom Publish Action */}
                <div className="mt-4 flex flex-col items-end gap-2">
                    <button
                        disabled={!isPublishable}
                        className="px-10 py-3 bg-blue-900 text-white font-bold tracking-wide rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        Objavi dokument
                    </button>
                    {!isPublishable && (
                        <p className="text-xs text-slate-500">
                            * Gumb za objavu postaje aktivan nakon popunjavanja svih tekstualnih polja i učitavanja PDF dokumenta.
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
}
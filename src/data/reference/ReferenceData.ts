import {useEffect, useState} from "preact/hooks";
import axiosClient from "../../api/AxiosClient.ts";

export interface ReferenceCategory {
    id: string;
    name: string;
}

export interface ReferenceAnalysis {
    id: string;
    abbr: string | null;
    nameEn: string;
    nameHr: string;
}

export function useCategoryReference() {
    const [categories, setCategories] = useState<ReferenceCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axiosClient.get<ReferenceCategory[]>('/reference-data/categories');
                setCategories(response.data);
            } catch (error) {
                console.error("Failed to load categories", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, isLoading };
}

export function useAnalysisTypeReference() {
    const [analysisTypes, setAnalysisTypes] = useState<ReferenceAnalysis[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalysisTypes = async () => {
            try {
                const response = await axiosClient.get<ReferenceAnalysis[]>('/reference-data/analysis-types');
                setAnalysisTypes(response.data);
            } catch (error) {
                console.error("Failed to load analysis types", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalysisTypes();
    }, []);

    return { analysisTypes, isLoading };
}

export function useGroupReference() {
    const [groups, setGroups] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await axiosClient.get<string[]>('/reference-data/groups');
                setGroups(response.data);
            } catch (error) {
                console.error("Failed to load groups", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroups();
    }, []);

    return { groups, isLoading };
}
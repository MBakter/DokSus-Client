/** Public user information as returned by the backend (`UserDto` on the server). */
export interface UserProfile {
    id: string;
    name: string;
    surname: string;
    email: string;
    isProfessor: boolean
}
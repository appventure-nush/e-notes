import {db} from "./app";

export let teachers: Teachers = {directory: []};

export function startListening(): (() => void)[] {
    const teachersRef = db.collection('config').doc('teachers');
    return [
        teachersRef.onSnapshot(d => teachers = d.data() as Teachers)
    ]
}

export interface Teachers {
    directory: Teacher[]
}

export interface Teacher {
    id: string;
    name: string;
    email_stupr: string;
    title: string;
    designation: string;
    department: string;
    department_name: string;
    subjects: string;
    subjects_name: string;
    active: true;
    name8: string;
    name4: string;
    officetel: string;
}
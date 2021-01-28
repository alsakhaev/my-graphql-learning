export type Post = {
    id: string;
    username: string;
    text: string;
}

export type Conference = {
    id?: number;
    short_name: string;
    name: string;
    description: string;
    date_from: string;
    date_to: string;
}

export type Profile = {
    namespace: string;
    username: string;
    fullname: string;
    img: string;
    main_conference_id: number | null;
}

export type Invitation = {
    username_from: string;
    username_to: string;
    conference_id: string;
    post_id: string;
}

export type Attendance = {
    conference_id: string;
    username: string;
}

export type Team = {
    id?: string;
    name: string;
    tags: Tag[];
}

export type Tag = {
    id?: string;
    name: string;
}
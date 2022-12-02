export class Playlist {
    name: string;
    tracks_href: string;
    href: string;
    api_id: string;
    uri: string;

    image_url: string = '';

    constructor(name: string, tracks_href: string, href: string, api_id: string, uri: string) {
        this.name = name;
        this.tracks_href = tracks_href;
        this.href = href;
        this.api_id = api_id;
        this.uri = uri;
    }

    addImageUrl(image_url: string): Playlist {
        this.image_url = image_url;
        return this;
    }
}

export class PlaylistOption {
    value: string;
    label: string;


    constructor(value: string, label: string) {
        this.value = value;
        this.label = label;
    }

    // value: string;
    // name: string;
    //
    //
    // constructor(value: string, name: string) {
    //     this.value = value;
    //     this.name = name;
    // }
}
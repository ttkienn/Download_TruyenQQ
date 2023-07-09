import axios from "axios";
import fs from "fs/promises";

axios.defaults.baseURL = "https://trungkien.dev/truyenqq";
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["Accept"] = "application/json";

interface ChapterData {
    name: string;
    other_name: string;
    descriptions: string;
    author: string;
    status: string;
    genres: string;
    chapters: string[];
}

const getChapter = async (url: string): Promise<ChapterData> => {
    const { data } = await axios.get(`/details?url=${url}`);
    return data;
};

const getImageChapter = async (url: string): Promise<string[]> => {
    const { data } = await axios.get(`/getChapters?url=${url}`);
    return data;
};

const makeDir = async (dir: string): Promise<void> => {
    try {
        await fs.mkdir(dir);
    } catch (error) {
        throw error;
    }
};

const downloadImage = async (
    url: string,
    dir: string,
    name: string
): Promise<void> => {
    const { data, headers } = await axios.get(url, {
        responseType: "arraybuffer",
        headers: {
            referer: "https://truyenqqhot.com/",
        },
    });
    const ext = headers["content-type"].split("/")[1];
    await fs.writeFile(`${dir}/${name}.${ext}`, Buffer.from(data, "binary"));
};

const removeAccents = (str: string): string => {
    return String(str)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
};

export { getChapter, getImageChapter, makeDir, downloadImage, removeAccents };

// const prompts = require("prompts");
// const chalk = require("chalk");
import prompts from "prompts";
import chalk from 'chalk';
import fs from "fs";
import { getChapter, getImageChapter, makeDir, downloadImage, removeAccents } from "./handler";

const askUrl = async (): Promise<string> => {
    const { url } = await prompts({
        type: "text",
        name: "url",
        message: "Nhập url truyện: ",
    });
    return url;
};

const selectChaptersToDownload = async (totalChapters: number): Promise<number> => {
    const { chapters } = await prompts({
        type: "number",
        name: "chapters",
        message: "Nhập tổng số chương muốn tải (vd: 100): ",
        initial: totalChapters,
    });
    return chapters;
};

const downloadChapter = async (chapterUrl: string, chapterNumber: number, name: string): Promise<void> => {
    const imageData = await getImageChapter(chapterUrl);
    const dir = `${__dirname}/manga/${removeAccents(name)}/Chapter ${chapterNumber}`;
    makeDir(dir);
    for (let i = 0; i < imageData.length; i++) {
        await downloadImage(imageData[i], dir, `${i + 1}`);
        process.stdout.write(`[+].${chalk.green("Đang tải ảnh:")} ${i + 1}/${imageData.length} [${name}]\r`);
    }
    console.log(`[+].${chalk.green("Đã tải xong chương:")} ${chapterNumber} [${name}]`);
};

const main = async (): Promise<void> => {
    if (!fs.existsSync(`${__dirname}/manga`)) makeDir(`${__dirname} / manga`);
    const timeStart = Date.now();
    const url = await askUrl();
    console.log(chalk.green("Đang tải dữ liệu..."));
    const { name, other_name, descriptions, author, status, genres, chapters } = await getChapter(url);
    console.clear();
    console.log(`[+].${chalk.green("Tên truyện:")} ${name}\n[+].${chalk.green("Tên khác:")} ${other_name}\n[+].${chalk.green("Tác giả:")} ${author}\n[+].${chalk.green("Trạng thái:")} ${status}\n[+].${chalk.green("Thể loại:")} ${genres}\n[+].${chalk.green("Mô tả:")} ${descriptions}\n[+].${chalk.green("Số chương:")} ${chapters.length}\n`);
    const selectedChapters = await selectChaptersToDownload(chapters.length);
    if (selectedChapters === 0 || selectedChapters > chapters.length) {
        console.log(chalk.red("Nhập sai số chương."));
        return;
    }
    if (!fs.existsSync(`${__dirname}/manga/${removeAccents(name)}`)) makeDir(`${__dirname}/manga/${removeAccents(name)}`);
    for (let i = 0; i < selectedChapters; i++) {
        await downloadChapter(chapters[i], i + 1, name);
    }
    console.log(`[+].${chalk.green("Đã tải xong truyện:")} ${name}[${(Date.now() - timeStart) / 1000}s]`);
    const { value } = await prompts({
        type: "confirm",
        name: "value",
        message: "Bạn có muốn tải lại truyện khác không? ",
    });
    if (value) {
        console.clear();
        await main();
    } else {
        console.log(chalk.red("Hẹn gặp lại bạn lần sau."));
    }
};

main();
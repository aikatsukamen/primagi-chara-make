import { Config, PartsData } from '../types/global';

export const partsJsonToTool = (json: any[]): PartsData => {
  const hairColor = json
    .filter((item) => item.categoryName === 'ヘアカラー')
    .map((item) => {
      return {
        name: item.partsName,
        img: `https://cdn.primagi.jp/assets/images/parts/thumb/img_${item.id}.png`,
      };
    });

  const hairStyle = json
    .filter((item) => item.categoryName === 'ヘアスタイル')
    .map((item) => {
      return {
        name: item.partsName,
        img: `https://cdn.primagi.jp/assets/images/parts/thumb/img_${item.id}.png`,
      };
    });

  const bangs = json
    .filter((item) => item.categoryName === 'まえがみ')
    .map((item) => {
      return {
        name: item.partsName,
        img: `https://cdn.primagi.jp/assets/images/parts/thumb/img_${item.id}.png`,
      };
    });

  return {
    hairColor,
    hairStyle,
    bangs,
  };
};

/**
 * CORS回避画像の取得
 * cacheに残ってればその画像を、そうでなければリクエストして画像を取得する
 */
const fetchPngImageAvoidCors = async (imageurl: string) => {
  console.log(`[fetchPngImageAvoidCors] ${imageurl}`);
  const cache = sessionStorage.getItem(`${imageurl}`);
  let isNeedGet = true;
  if (cache) {
    try {
      const init: RequestInit = {
        referrerPolicy: 'no-referrer',
      };
      await fetch(cache, init);
      isNeedGet = false;
    } catch (e) {
      // キャッシュリストにはあるんだけど何か取れなかった
      console.log('blobに無いので再取得: ' + imageurl);
    }
  }
  if (isNeedGet) {
    const res = await fetch(imageurl);
    const buf = await res.arrayBuffer();
    const blob = new Blob([buf], { type: 'image/png' });
    const url = URL.createObjectURL(blob);

    sessionStorage.setItem(imageurl, url);
    return url;
  } else {
    return cache as string;
  }
};

const loadImage = async (image: HTMLImageElement) => {
  await new Promise<void>((resolve) => {
    image.onload = () => {
      resolve();
    };
    image.onerror = () => {
      console.warn('読み込み失敗');
      resolve();
    };
  });
};

export const createImage = async (config: Config, hairStyle: string, bangs: string, hairColor: string): Promise<void> => {
  const canvas1 = document.getElementById('mychara1') as HTMLCanvasElement;
  const canvas2 = document.getElementById('mychara2') as HTMLCanvasElement;
  createCanvas(canvas1, config, hairStyle, hairColor);
  createCanvas(canvas2, config, bangs, hairColor);
};

const createCanvas = async (canvas: HTMLCanvasElement, config: Config, hairStyle: string, hairColor: string) => {
  const PAPER_WIDTH = 180;
  const PAPER_HEIGHT = 300;
  canvas.width = PAPER_WIDTH;
  canvas.height = PAPER_HEIGHT;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  // 背景色は白
  ctx.fillStyle = 'rgb(255,255,255)';
  ctx.fillRect(0, 0, PAPER_WIDTH, PAPER_HEIGHT);

  // ヘアスタイル
  if (!hairStyle) return;
  const hairStyleImage = new Image();
  hairStyleImage.src = await fetchPngImageAvoidCors(`${config.api.ajax}${hairStyle}`);
  await loadImage(hairStyleImage);

  // ヘアスタイル画像
  ctx.drawImage(hairStyleImage, 10, 10);

  if (!hairColor) return;

  const color1List: number[] = [];
  const color2List: number[] = [];

  // デフォの髪色を透過する
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let r = 137;
  let g = 69;
  let b = 92;
  for (let i = 0; i < imageData.width * imageData.height; i++) {
    if (Math.abs(imageData.data[i * 4] - r) < 30 && Math.abs(imageData.data[i * 4 + 1] - g) < 30 && Math.abs(imageData.data[i * 4 + 2] - b) < 30) {
      // imageData.data[i * 4 + 3] = 0;
      color1List.push(i);
    }
  }
  ctx.putImageData(imageData, 0, 0);

  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  r = 87;
  g = 39;
  b = 54;
  for (let i = 0; i < imageData.width * imageData.height; i++) {
    if (Math.abs(imageData.data[i * 4] - r) < 30 && Math.abs(imageData.data[i * 4 + 1] - g) < 30 && Math.abs(imageData.data[i * 4 + 2] - b) < 30) {
      // imageData.data[i * 4 + 3] = 0;
      color2List.push(i);
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // 髪色画像から色を取得する
  const colors = await getHairColor(`${config.api.ajax}${hairColor}`);

  console.log('色塗り開始');
  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < imageData.width * imageData.height; i++) {
    if (color1List.includes(i)) {
      imageData.data[i * 4] = colors.color1[0];
      imageData.data[i * 4 + 1] = colors.color1[1];
      imageData.data[i * 4 + 2] = colors.color1[2];
      imageData.data[i * 4 + 3] = colors.color1[3];
    }

    if (color2List.includes(i)) {
      imageData.data[i * 4] = colors.color2[0];
      imageData.data[i * 4 + 1] = colors.color2[1];
      imageData.data[i * 4 + 2] = colors.color2[2];
      imageData.data[i * 4 + 3] = colors.color2[3];
    }
  }
  ctx.putImageData(imageData, 0, 0);
};

const getHairColor = async (url: string): Promise<{ color1: Uint8ClampedArray; color2: Uint8ClampedArray }> => {
  const colorImage = new Image();
  colorImage.src = await fetchPngImageAvoidCors(url);
  await loadImage(colorImage);

  const canvas = document.createElement('canvas'); // canvas 要素を生成
  const context = canvas.getContext('2d') as CanvasRenderingContext2D; // 二次元で扱う
  context.drawImage(colorImage, 0, 0, colorImage.width, colorImage.height); // 二次元上に画像要素から画像を描画。途中の 0,0 は座標で左上を指す
  // canvas 中の座標を指定して該当部の色情報を取得
  // imgData の data プロパティ中に RGBA 色情報が格納されている
  const imgData1 = context.getImageData(85, 122, 1, 1);
  const imgData2 = context.getImageData(28, 113, 1, 1);

  return {
    color1: imgData1.data,
    color2: imgData2.data,
  };
};

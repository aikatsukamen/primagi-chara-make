import React from 'react';
import { Config, PartsData, Part } from '../../../types/global';
import { Waypoint } from 'react-waypoint';
import { createA4PrintImage } from '../../../common/util';

/** Jsonファイルを取得 */
async function fetchJson<T>(url: string): Promise<T> {
  const result = await fetch(url);
  const json = await result.json();
  return json as T;
}

const App: React.FC = () => {
  // どっかから取ってくるデータ
  const [config, setConfig] = React.useState<Config>();
  const [parts, setParts] = React.useState<PartsData>({ bangs: [], hairColor: [], hairStyle: [] });
  const [bangs, setBangs] = React.useState<PartsData['bangs']>([]);
  const [hairStyle, setHairStyle] = React.useState<PartsData['hairStyle']>([]);
  const [hairColor, sethaircolor] = React.useState<PartsData['hairColor']>([]);
  const handleWaypointEnterBangs = () => setBangs(bangs.concat(objectCopy(parts.bangs)));
  const handleWaypointEnterhairStyle = () => setHairStyle(hairStyle.concat(objectCopy(parts.hairStyle)));
  const handleWaypointEnterhairColor = () => sethaircolor(hairColor.concat(objectCopy(parts.hairColor)));
  const objectCopy = (obj: any) => JSON.parse(JSON.stringify(obj));

  // 選択中の情報
  const [selectHairStyle, setselectHairStyle] = React.useState<Part>({ name: '', img: '', description: '' });
  const [selectHairColor, setselectHairColor] = React.useState<Part>({ name: '', img: '', description: '' });
  const [selectBang, setselectBang] = React.useState<Part>({ name: '', img: '', description: '' });

  const clickHairStyle = (item: Part) => () => {
    console.log('ポチッ');
    setselectHairStyle(item);
  };

  /** カード情報を取得 */
  const fetchCardList = async () => {
    const time = new Date().getTime();

    let file = `./config.json?t=${time}`;
    const config = await fetchJson<Config>(file);
    setConfig(config);

    file = `./parts.json?t=${time}`;
    const parts = await fetchJson<PartsData>(file);
    setParts(parts);
    setBangs(objectCopy(parts.bangs));
    setHairStyle(objectCopy(parts.hairStyle));
    sethaircolor(objectCopy(parts.hairColor));
  };

  React.useEffect(() => {
    fetchCardList().then(() => {
      createA4PrintImage(config as Config, selectHairStyle.img, selectBang.img, selectHairColor.img);
    });
  }, []);

  React.useEffect(() => {
    createA4PrintImage(config as Config, selectHairStyle.img, selectBang.img, selectHairColor.img);
  }, [selectHairColor, selectHairStyle, selectBang]);

  const hairStyleComponent = hairStyle
    .map((item, key) => (
      <div key={key} onClick={clickHairStyle(item)}>
        <div style={{ width: 100 }}>
          <img src={item.img} height={150} />
        </div>
      </div>
    ))
    .concat(<Waypoint key={-1} horizontal onEnter={handleWaypointEnterhairStyle} />);

  const bangComponent = bangs
    .map((item, key) => (
      <div key={key} onClick={() => setselectBang(item)}>
        <div style={{ width: 100 }}>
          <img src={item.img} height={150} />
        </div>
      </div>
    ))
    .concat(<Waypoint key={-1} horizontal onEnter={handleWaypointEnterBangs} />);

  const hairColorComponent = hairColor
    .map((item, key) => (
      <div key={key} onClick={() => setselectHairColor(item)}>
        <div style={{ width: 100 }}>
          <img src={item.img} height={150} />
        </div>
      </div>
    ))
    .concat(<Waypoint key={-1} horizontal onEnter={handleWaypointEnterhairColor} />);

  return (
    <div>
      <div className={'SW-update-dialog'} />
      <div style={{ backgroundColor: 'white' }}>
        <canvas id="mychara1" width={window.innerWidth - 30} /> <canvas id="mychara2" width={window.innerWidth - 30} />
      </div>
      {/* ヘアスタイル */}
      <div style={{ display: 'flex', overflowX: 'auto' }}>{hairStyleComponent}</div>
      <div style={{ display: 'flex', overflowX: 'auto' }}>{bangComponent}</div>
      {/* ヘアカラー */}
      <div style={{ display: 'flex', overflowX: 'auto' }}>{hairColorComponent}</div>
    </div>
  );
};

export default App;

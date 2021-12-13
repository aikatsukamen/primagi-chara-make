import React from 'react';
import { Config, PartsData, Part } from '../../../types/global';
import { Waypoint } from 'react-waypoint';
import { createImage, partsJsonToTool } from '../../../common/util';

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

  const isSmartPhone = (() => {
    if (navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
      return true;
    } else {
      return false;
    }
  })();

  // 選択中の情報
  const [selectHairStyle, setselectHairStyle] = React.useState<Part>({ name: '', img: '' });
  const [selectHairColor, setselectHairColor] = React.useState<Part>({ name: '', img: '' });
  const [selectBang, setselectBang] = React.useState<Part>({ name: '', img: '' });

  const clickHairStyle = (item: Part) => () => {
    console.log('ポチッ');
    setselectHairStyle(item);
  };

  /** カード情報を取得 */
  const fetchCardList = async () => {
    const time = new Date().getTime();

    const file = `./config.json?t=${time}`;
    const config = await fetchJson<Config>(file);
    setConfig(config);

    try {
      const parts = localStorage.getItem('parts');
      if (parts) {
        const json = JSON.parse(parts);
        const list: PartsData = partsJsonToTool(json);
        setParts(list);
        setBangs(objectCopy(list.bangs));
        setHairStyle(objectCopy(list.hairStyle));
        sethaircolor(objectCopy(list.hairColor));
      }
    } catch (e) {
      // 無いらしい
    }

    try {
      const partsUrl = 'https://cdnprimagiimg01.blob.core.windows.net/primagi/assets/data/parts.json';
      const json = await fetchJson<any[]>(config.api.ajax + partsUrl);
      const parts = partsJsonToTool(json);
      if (parts && Array.isArray(parts.bangs) && Array.isArray(parts.hairStyle) && Array.isArray(parts.hairColor)) {
        setParts(parts);
        setBangs(objectCopy(parts.bangs));
        setHairStyle(objectCopy(parts.hairStyle));
        sethaircolor(objectCopy(parts.hairColor));
      }
    } catch (e) {
      //
    }
  };

  React.useEffect(() => {
    fetchCardList().then(() => {
      createImage(config as Config, selectHairStyle.img, selectBang.img, selectHairColor.img);
    });
  }, []);

  React.useEffect(() => {
    createImage(config as Config, selectHairStyle.img, selectBang.img, selectHairColor.img);
  }, [selectHairColor, selectHairStyle, selectBang]);

  const hairStyleComponent = () => {
    let dom = hairStyle.map((item, key) => (
      <div key={key} onClick={clickHairStyle(item)}>
        <div style={{ width: 100 }}>
          <img src={item.img} height={150} />
        </div>
      </div>
    ));

    if (isSmartPhone) {
      dom = dom.concat(<Waypoint key={-1} horizontal onEnter={handleWaypointEnterhairStyle} />);
    }
    return dom;
  };

  const bangComponent = () => {
    let dom = bangs.map((item, key) => (
      <div key={key} onClick={() => setselectBang(item)}>
        <div style={{ width: 100 }}>
          <img src={item.img} height={150} />
        </div>
      </div>
    ));
    if (isSmartPhone) {
      dom = dom.concat(<Waypoint key={-1} horizontal onEnter={handleWaypointEnterBangs} />);
    }
    return dom;
  };

  const hairColorComponent = () => {
    let dom = hairColor.map((item, key) => (
      <div key={key} onClick={() => setselectHairColor(item)}>
        <div style={{ width: 100 }}>
          <img src={item.img} height={150} />
        </div>
      </div>
    ));
    if (isSmartPhone) {
      dom = dom.concat(<Waypoint key={-1} horizontal onEnter={handleWaypointEnterhairColor} />);
    }
    return dom;
  };

  return (
    <div>
      <div className={'SW-update-dialog'} />
      <div style={{ backgroundColor: 'white', height: 200, display: 'flex' }}>
        <canvas id="mychara1" height={200} width={200} style={{ marginRight: 40, marginLeft: 10 }} />
        <canvas id="mychara2" height={200} width={200} />
      </div>
      {/* ヘアスタイル */}
      <div style={{ display: 'flex', overflowX: 'auto' }}>{hairStyleComponent()}</div>
      <div style={{ display: 'flex', overflowX: 'auto' }}>{bangComponent()}</div>
      {/* ヘアカラー */}
      <div style={{ display: 'flex', overflowX: 'auto' }}>{hairColorComponent()}</div>
    </div>
  );
};

export default App;

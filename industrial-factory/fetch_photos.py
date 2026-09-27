"""Fetch a small, attributed photo selection from the four report sources.
Only public listing media is processed. No private documents or buyer data.
"""
import concurrent.futures, io, json, re, time
from pathlib import Path
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup
from PIL import Image
ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'photos'
OUT.mkdir(exist_ok=True)
SOURCES = {
 'Y01': 'https://buy.yungching.com.tw/house/7502975',
 'Y02': 'https://buy.yungching.com.tw/house/7076589',
 'Y03': 'https://www.xn--8pr24e9bz5p7pbk9fi3bj6lt4r9u1aje3brb3b.tw/m2/showobj.php?objno=a1791261',
 'M01': 'https://business.591.com.tw/sale/20959756'
}
KEY_END = 'qVhtUUJ4lA_cF1mBh5MY1RWd5eEaa7mn9qxu8f6s-rtKfVoBsurTgAnsNQ3b1ueVa0jD0JJgeWt02Xc92Hgeax9ptXAdU5ZuHyqQdxAoaDgB84hAAJBJ-aPJnP6QjjHNJdO-8s9VPXXQ_ruSEFqcK8ShYsvown2RKluDB4vs3XCba78wTuCNPINc3dOPPQMQruh-Gt23mTzaYgmqa__ngegw_kxkxkdM5Y2LgriectG9txh5JQn0mw'
PREFIXES = {
 'Y01': ['NF58Ko5oaCso-SCNSF6JyJJw9OZr8r48BY21OvUz928nk4T2r59Sh5PbZ_vCs7bB','NF58Ko5oaCv7slvffkWXmOUSze6Mlq32-5zfwEElR8o6hr_BLPxQPB3iVDdEms3X','NF58Ko5oaCtCenA3lv7FVstC_37UZQwJsYLFxU_OcZNw2CbXWay1tq-ti-CstXHo'],
 'Y02': ['NF58Ko5oaCsAFwm-DE7Q2u-eocVA3fFawjx1DNq7Tg8WllncBW3gelz6kBqi0CtW','NF58Ko5oaCuajHRNofAGNXhNzV6OVVmFK2gWg6B1XA9gHs1xUb0qGsmOsvAI9-hW','NF58Ko5oaCslgrzJwz8xy_IkpKcP9-uZZDxUObW_nNySmdee3nKKXDLs6yvjGLqV']
}
FALLBACK = {k: ['https://yccdn.yungching.com.tw/v1/image/?height=768&key='+p+KEY_END+'&width=1024' for p in v] for k,v in PREFIXES.items()}
FALLBACK['Y03'] = ['https://upload.iyudigi.com/IHOUSE/039/WL01901722/WL01901722/'+x+'.webp?a=20260924100515' for x in ['l66c943c26688e','l66c943c2df791','l66c943c35209d','l66c943c3bd793']]
HEADERS = {'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36','Accept-Language':'zh-TW,zh;q=0.9,en;q=0.7'}

def candidates(case, url):
    found = list(FALLBACK.get(case, []))
    note = ''
    try:
        r = requests.get(url, headers=HEADERS, timeout=40)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, 'html.parser')
        for img in soup.find_all('img'):
            for attr in ('data-src','data-original','src'):
                v = img.get(attr,'')
                if not v or v.startswith('data:'): continue
                v = urljoin(url,v)
                if case in ('Y01','Y02') and 'yccdn.yungching.com.tw/v1/image/' in v: found.append(v)
                if case == 'Y03' and '/IHOUSE/' in v and 'l66c943' in v: found.append(v)
                if case == 'M01' and '591' in v and any(t in v for t in ('/house/','/houseimg/','/upload/')): found.append(v)
        if case == 'M01':
            for raw in re.findall(r'https?:[^\s<>"\']+',r.text.replace('\\/','/')):
                if ('591' in raw or 'imgs.591' in raw) and '/house/' in raw and not any(t in raw for t in ('avatar','logo','head')):
                    found.append(raw.replace('&amp;','&'))
        note = 'source HTTP '+str(r.status_code)
    except Exception as exc:
        note = 'source read: '+type(exc).__name__
    return list(dict.fromkeys(found)), note

def process(case):
    source=SOURCES[case]
    urls,note=candidates(case,source)
    photos=[]
    errors=[]
    fingerprints=set()
    for url in urls[:32]:
        if len(photos)>=4: break
        try:
            r=requests.get(url,headers={**HEADERS,'Referer':source},timeout=30)
            r.raise_for_status()
            im=Image.open(io.BytesIO(r.content)); im.load()
            if im.width<380 or im.height<230: continue
            fp=im.resize((32,32)).convert('RGB').tobytes()
            if fp in fingerprints: continue
            fingerprints.add(fp)
            ext={'JPEG':'jpg','PNG':'png','WEBP':'webp','GIF':'gif'}.get(im.format,'jpg')
            filename=f'{case.lower()}-{len(photos)+1}.{ext}'
            (OUT/filename).write_bytes(r.content)
            photos.append({'src':'photos/'+filename,'original':url,'source':source,'width':im.width,'height':im.height,'caption':f'{case} 原刊登照片 {len(photos)+1}（拍攝日期、現況與標的對應仍須承辦確認）'})
        except Exception as exc:
            errors.append(type(exc).__name__)
    return case,{'source':source,'photos':photos,'note':note,'failed_attempts':len(errors)}

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    result=dict(pool.map(process,SOURCES))
(ROOT/'photos.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:{'photos':len(v['photos']),'note':v['note'],'failed_attempts':v['failed_attempts']} for k,v in result.items()},ensure_ascii=False))

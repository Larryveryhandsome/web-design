"""Download unchanged source photos and run scoped browser checks for this page."""
import hashlib
import io
import json
import threading
import time
import zipfile
from datetime import datetime, timezone
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import requests
from PIL import Image
from playwright.sync_api import sync_playwright

PROJECT = Path(__file__).resolve().parent
ROOT = PROJECT.parent
PHOTOS = PROJECT / 'photos'
REVIEW = PROJECT / 'review'
PHOTOS.mkdir(exist_ok=True)
REVIEW.mkdir(exist_ok=True)
SOURCES = [
    ('01.jpg', 'https://www.tdw.tw/uploads/image/20261007/1791366007326004.jpg'),
    ('02.jpg', 'https://www.tdw.tw/uploads/image/20261007/1791366007890723.jpg'),
    ('03.jpg', 'https://www.tdw.tw/uploads/image/20261007/1791366007880476.jpg'),
    ('04.jpg', 'https://www.tdw.tw/uploads/image/20261007/1791366007403831.jpg'),
]
REPORT = {'generated_at': datetime.now(timezone.utc).isoformat(), 'photos': [], 'viewports': [], 'checks': {}, 'passed': False}


def prepare():
    session = requests.Session()
    session.headers.update({'User-Agent': 'Mozilla/5.0'})
    for name, url in SOURCES:
        for attempt in range(4):
            try:
                response = session.get(url, timeout=(20, 60))
                response.raise_for_status()
                data = response.content
                image = Image.open(io.BytesIO(data))
                assert image.format == 'JPEG', (name, image.format)
                width, height = image.size
                assert width >= 600 and height >= 400, (name, image.size)
                image.verify()
                (PHOTOS / name).write_bytes(data)
                REPORT['photos'].append({'file': 'photos/' + name, 'width': width, 'height': height, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(), 'unchanged_original_bytes': True})
                print('Saved unchanged original:', name, width, height)
                break
            except Exception:
                if attempt == 3:
                    raise
                time.sleep(2 ** attempt)
    path = PROJECT / 'index.html'
    html = path.read_text(encoding='utf-8')
    old_css = '.photo-open{padding:7px 8px;font-size:9px;bottom:16px;right:12px}'
    new_css = '.photo-open{padding:7px 8px;font-size:9px;top:12px;bottom:auto;right:12px}'
    if old_css in html:
        html = html.replace(old_css, new_css, 1)
        path.write_text(html, encoding='utf-8')
    assert new_css in html, 'Mobile photo control adjustment missing'
    for forbidden in ['何思霆', '0916006680', '0916-006-680', '永慶', '永恆', '洪子甯', '土地王', 'tdw.tw', '林其衛']:
        assert forbidden not in html, 'Prior contact or brand remained'
    for required in ['林其衞', '0928-880-392', '0928880392', '佳慶不動產有限公司', '江鳳益', '00359', '88,550', '3,390', '5,400', '70%', '300%', 'B1–3F']:
        assert required in html, 'Missing expected information: ' + required
    REPORT['checks']['original_contact_removed'] = True
    REPORT['checks']['property_data_preserved'] = True


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def check_browser():
    server = ThreadingHTTPServer(('127.0.0.1', 8765), partial(QuietHandler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    errors = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            context = browser.new_context(viewport={'width': 1440, 'height': 1000}, device_scale_factor=1, locale='zh-TW', permissions=['clipboard-read', 'clipboard-write'])
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            url = 'http://127.0.0.1:8765/tongluo-factory/'
            response = page.goto(url, wait_until='networkidle')
            assert response.status == 200
            page.evaluate('document.fonts.ready')
            assert page.locator('.gallery img').count() == 4
            for image in page.locator('.gallery img').all():
                assert image.evaluate('(el) => el.complete && el.naturalWidth >= 600')
            links = page.locator('a[href^="tel:"]').evaluate_all('(els) => els.map(el => el.getAttribute("href"))')
            assert links and set(links) == {'tel:+886928880392'}, links
            line_links = page.locator('a[href^="https://line.me/"]').evaluate_all('(els) => els.map(el => el.href)')
            assert line_links and set(line_links) == {'https://line.me/ti/p/~0928880392'}, line_links
            REPORT['checks']['contact_links_correct'] = True
            REPORT['checks']['all_four_photos_loaded'] = True
            for width in [320, 375, 390, 430, 768, 1024, 1440]:
                page.set_viewport_size({'width': width, 'height': 1000})
                page.evaluate('window.scrollTo(0, 0)')
                page.wait_for_timeout(200)
                layout = page.evaluate('({width:innerWidth, documentWidth:document.documentElement.scrollWidth, bodyWidth:document.body.scrollWidth})')
                assert layout['documentWidth'] <= width + 1 and layout['bodyWidth'] <= width + 1, layout
                assert page.locator('.mobile-dock').is_visible() == (width <= 600)
                if width <= 600:
                    caption = page.locator('.photo-caption').bounding_box()
                    control = page.locator('.photo-open').bounding_box()
                    overlap = min(caption['x'] + caption['width'], control['x'] + control['width']) > max(caption['x'], control['x']) and min(caption['y'] + caption['height'], control['y'] + control['height']) > max(caption['y'], control['y'])
                    assert not overlap, ('Mobile photo caption overlap', width)
                REPORT['viewports'].append({'width': width, 'horizontal_overflow': False, 'contact_bar_correct': True})
                if width in [390, 1440]:
                    label = 'mobile' if width == 390 else 'desktop'
                    page.screenshot(path=str(REVIEW / (label + '.jpg')), type='jpeg', quality=85)
                    page.screenshot(path=str(REVIEW / (label + '-full.jpg')), type='jpeg', quality=80, full_page=True)
            page.locator('[data-photo="0"]').click()
            assert page.locator('#lightbox').evaluate('(el) => el.open')
            assert page.locator('#lb-counter').inner_text() == '01 / 04'
            for i in range(4):
                page.locator('[data-lb="%s"]' % i).click()
                assert page.locator('#lb-image').get_attribute('src') == 'photos/%02d.jpg' % (i + 1)
                page.wait_for_function('document.querySelector("#lb-image").complete && document.querySelector("#lb-image").naturalWidth >= 600')
                if i == 1:
                    assert '並非本案' in page.locator('#lb-note').inner_text()
            page.keyboard.press('ArrowRight')
            assert page.locator('#lb-counter').inner_text() == '01 / 04'
            page.keyboard.press('ArrowLeft')
            assert page.locator('#lb-counter').inner_text() == '04 / 04'
            page.keyboard.press('Escape')
            assert not page.locator('#lightbox').evaluate('(el) => el.open')
            assert page.locator('[data-photo="0"]').evaluate('(el) => el === document.activeElement')
            REPORT['checks']['gallery_keyboard_close_focus_restore'] = True
            REPORT['checks']['area_photo_clearly_labeled'] = True
            page.locator('[data-copy-line]').click()
            page.wait_for_function('navigator.clipboard.readText().then(text => text === "0928880392")')
            page.locator('#copy-inquiry').click()
            page.wait_for_function('navigator.clipboard.readText().then(text => text.includes("3,390坪") && text.includes("88,550萬元"))')
            page.evaluate('Object.defineProperty(navigator, "share", {value:undefined, configurable:true})')
            page.locator('#share-bottom').click()
            page.wait_for_function('navigator.clipboard.readText().then(text => text === "https://larryveryhandsome.github.io/web-design/tongluo-factory/")')
            REPORT['checks']['copy_line_inquiry_and_share'] = True
            page.emulate_media(media='print')
            assert not page.locator('.mobile-dock').is_visible()
            assert not page.locator('.nav').is_visible()
            assert page.locator('.advisor-phone').is_visible()
            REPORT['checks']['print_contact_visible'] = True
            page.emulate_media(media='screen')
            context.close()
            touch = browser.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True, locale='zh-TW')
            mobile = touch.new_page()
            mobile.goto(url, wait_until='networkidle')
            mobile.locator('[data-photo="0"]').tap()
            mobile.locator('#lb-image').evaluate('''el => {
              const a = new Touch({identifier:1,target:el,clientX:320,clientY:200});
              const b = new Touch({identifier:1,target:el,clientX:100,clientY:205});
              el.dispatchEvent(new TouchEvent('touchstart',{touches:[a],changedTouches:[a],bubbles:true}));
              el.dispatchEvent(new TouchEvent('touchend',{touches:[],changedTouches:[b],bubbles:true}));
            }''')
            assert mobile.locator('#lb-counter').inner_text() == '02 / 04'
            mobile.locator('#lb-close').tap()
            assert not mobile.locator('#lightbox').evaluate('(el) => el.open')
            REPORT['checks']['mobile_swipe_and_close'] = True
            touch.close()
            browser.close()
        assert not errors, errors
        REPORT['checks']['no_javascript_errors'] = True
    finally:
        server.shutdown()
        REPORT['javascript_errors'] = errors


if __name__ == '__main__':
    try:
        prepare()
        check_browser()
        REPORT['passed'] = True
        with zipfile.ZipFile(REVIEW / 'tongluo-factory-website.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
            archive.write(PROJECT / 'index.html', 'index.html')
            for name, _ in SOURCES:
                archive.write(PHOTOS / name, 'photos/' + name)
    except Exception as error:
        REPORT['error'] = str(error)
        raise
    finally:
        (REVIEW / 'report.json').write_text(json.dumps(REPORT, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(json.dumps(REPORT, ensure_ascii=False, indent=2))

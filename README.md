# o262010

Thiệp chúc mừng 20/10 (Ngày Phụ nữ Việt Nam) gửi QanhQanh, song ngữ VI/EN.
Live: https://oanh262010.vinhltt.com

## Thêm ảnh

1. Copy ảnh vào `photos/` (jpg, jpeg, png, webp, gif, avif; tên tùy ý).
2. `git add photos && git commit -m "add photos" && git push`

GitHub Actions tự tạo `photos.json` từ thư mục `photos/` và deploy lại. Không cần sửa code.
Nên nén ảnh trước (cạnh dài ~1200px) để trang tải nhanh trên điện thoại.

## Sửa lời chúc

Sửa `config.js`: tên người nhận, người ký, lời chúc VI/EN. `{name}` được thay bằng tên người nhận.

## Nhạc nền

Sửa `musicUrl` trong `config.js` thành link YouTube bất kỳ, hoặc để `""` nếu không muốn có nhạc.
Trang thử phát nhạc ngay khi vào. Nếu trình duyệt chặn (thường gặp trên điện thoại), nhạc sẽ bắt đầu từ đầu bài ở lần chạm đầu tiên, tức lúc mở phong bì.
Nút ♪ ở góc trên bên trái dùng để bật/tắt nhạc. Nếu video bị gỡ hoặc chặn nhúng thì nút tự ẩn và thiệp vẫn chạy bình thường.
Một số bài nhạc có bản quyền bị YouTube chặn khi chạy ở `localhost`, nhưng vẫn phát được trên domain thật.

## Xem thử trên máy

```bash
node scripts/build-photos-manifest.mjs
npx serve .        # hoặc: python -m http.server
```

Mở trực tiếp `index.html` bằng file:// vẫn thấy thiệp, nhưng không có ảnh nền (trình duyệt chặn đọc `photos.json`).

## Deploy

GitHub Pages, source = **GitHub Actions** (`.github/workflows/deploy-pages.yml`).
Custom domain `oanh262010.vinhltt.com` đặt trong Settings → Pages; DNS là CNAME `oanh262010 → vinhltt.github.io`.

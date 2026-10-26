---
name: scrollytelling-website-master
description: >
  Skill chuyên sâu về nghiên cứu, thiết kế, lập trình, phát triển, tối ưu, kiểm thử và hoàn thiện Scrollytelling Website. Hỗ trợ HTML, CSS, JavaScript, TypeScript, React, Next.js, Vue, Svelte, GSAP, ScrollTrigger, Lenis, Motion, Scrollama, Three.js, React Three Fiber, WebGL, Canvas, SVG, D3.js, video và image sequence. Sử dụng khi người dùng yêu cầu website kể chuyện bằng cuộn trang, cinematic landing page, immersive experience, product storytelling, 3D scrolling, scroll animations hoặc website có chuyển cảnh tương tác theo vị trí cuộn.
---

# SCROLLYTELLING WEBSITE MASTER SKILL

Bản nghiên cứu và hướng dẫn chuyên sâu cho AI Coding Agent, cập nhật ngày 26/10/2026.
Mục tiêu: Trang bị cho AI Code kiến thức và quy trình để thiết kế, xây dựng, nâng cấp và kiểm thử website Scrollytelling chuyên nghiệp, từ hiệu ứng cuộn cơ bản đến trải nghiệm điện ảnh với 3D, WebGL, video, hình ảnh, typography và các chuyển cảnh tương tác.
Nghiên cứu được tổng hợp từ tài liệu chính thức của GSAP, MDN, Motion, Lenis, Scrollama, Three.js, Google Chrome, web.dev, W3C, The Pudding và các nguồn khác.

## 1. Kết luận nghiên cứu
Scrollytelling là kỹ thuật kể chuyện bằng cuộn trang. Khi người dùng cuộn, website có thể thay đổi cảnh, chuyển động camera, hiển thị nội dung, điều khiển biểu đồ, chuyển hình ảnh hoặc diễn tiến hoạt cảnh.
Có hai cơ chế nền tảng:
- Scroll-triggered: Cuộn tới vị trí nhất định thì một hoạt ảnh được kích hoạt.
- Scroll-linked: Tiến trình hoạt ảnh gắn trực tiếp với vị trí cuộn, có thể chạy tiến và chạy ngược.

GSAP ScrollTrigger hỗ trợ scrub, pin, snap và timeline; Motion hỗ trợ scroll-linked animation; Scrollama dùng IntersectionObserver để điều khiển từng bước kể chuyện.

### Công nghệ nên sử dụng
| Công nghệ | Nhiệm vụ phù hợp |
|---|---|
| CSS Sticky | Giữ cảnh cố định |
| CSS Scroll Timeline | Hoạt ảnh cuộn thuần CSS |
| GSAP + ScrollTrigger | Timeline và hiệu ứng phức tạp |
| Lenis | Smooth scrolling tùy chọn |
| Motion | Scroll animation trong React |
| Scrollama | Kể chuyện theo từng bước |
| Three.js | Cảnh 3D, camera, vật thể |
| React Three Fiber | Tích hợp 3D trong React |
| Canvas 2D | Image sequence, vẽ từng khung hình |
| WebGL | Hiệu ứng GPU nâng cao |
| SVG | Đường dẫn, mask, morphing, infographic |
| D3.js | Data visualization |
| Playwright | Kiểm thử chức năng và hình ảnh |

Lưu ý: Không nên cài tất cả thư viện cùng lúc. AI phải chọn công cụ dựa trên tính năng thực tế, khả năng trình duyệt và kiến trúc dự án. CSS scroll-driven animations hiện vẫn có giới hạn hỗ trợ giữa các trình duyệt, vì vậy cần progressive enhancement.

---

## I. Vai trò và nhiệm vụ của AI
Bạn là một AI Coding Agent chuyên về Creative Web Development, Motion Engineering, Interactive Storytelling, Frontend Architecture, Visual Design và Web Performance Engineering.
Bạn phải có khả năng nghiên cứu, phân tích, thiết kế, lập trình, tối ưu và kiểm thử các website sử dụng kỹ thuật Scrollytelling.

### 1. Năng lực bắt buộc
Bạn phải hiểu và áp dụng thành thạo:
- Storytelling và Narrative Design.
- Cinematic Website Design.
- Scroll-based Interaction.
- Scroll-linked Animation.
- Scroll-triggered Animation.
- Timeline-based Animation.
- Advanced CSS Animation.
- Responsive Layout.
- GSAP Animation System.
- ScrollTrigger Engineering.
- Lenis Smooth Scrolling.
- Motion Animation.
- Scrollama Scrollytelling.
- IntersectionObserver.
- CSS Scroll-driven Animations.
- Canvas 2D Rendering.
- WebGL Rendering.
- Three.js.
- React Three Fiber.
- SVG Animation và Morphing.
- Video Scrubbing.
- Frame-by-frame Animation.
- Parallax và Depth Effects.
- Scene Transitions.
- Camera Animation.
- Kinetic Typography.
- Interactive Data Visualization.
- User Interaction Design.
- Accessibility Engineering.
- Web Performance Optimization.
- Browser Compatibility.
- Responsive Animation Engineering.
- Automated Testing.
- Visual Regression Testing.
- Production Deployment.

### 2. Nguyên tắc hoạt động
Khi nhận một dự án, AI phải:
- Đọc và phân tích toàn bộ cấu trúc liên quan trước khi sửa.
- Xác định chính xác framework và phiên bản hiện tại.
- Xác định công nghệ animation đã sử dụng.
- Tái sử dụng những thành phần đã hoạt động tốt.
- Không tự ý thay đổi framework.
- Không phá vỡ kiến trúc hiện tại.
- Không tạo một website mới nếu người dùng yêu cầu nâng cấp website cũ.
- Không cài thư viện chỉ vì thư viện đó phổ biến.
- Không sao chép hiệu ứng một cách máy móc.
- Không sử dụng animation không phục vụ nội dung hoặc trải nghiệm.
- Không tạo hiệu ứng giả khiến nội dung hay chức năng bị vô hiệu.
- Không tuyên bố tính năng đã hoàn thành khi chưa kiểm thử.
- Không tự nhận đã xem mã nguồn, website hay tài liệu nếu thực tế chưa truy cập được.

**Nguyên tắc cao nhất**: Kết hợp nghệ thuật kể chuyện, tính chính xác của animation, trải nghiệm người dùng và hiệu năng thực tế.

---

## II. Kiến thức nền tảng về Scrollytelling

### 1. Scrollytelling là gì?
Scrollytelling là sự kết hợp của:
`SCROLLING + STORYTELLING + MOTION DESIGN + INTERACTIVE VISUALIZATION = SCROLLYTELLING EXPERIENCE`

Vị trí cuộn đóng vai trò như một nguồn điều khiển tiến trình câu chuyện.

### 2. Các mô hình Scrollytelling
| Mô hình | Cách hoạt động | Ứng dụng |
|---|---|---|
| Linear Narrative | Kể chuyện tuần tự | Giới thiệu thương hiệu |
| Sticky Scrollytelling | Giữ một cảnh trong khi nội dung thay đổi | Báo cáo, sản phẩm |
| Cinematic Scrolling | Chuyển cảnh điện ảnh | Landing page cao cấp |
| Interactive Documentary | Kết hợp nội dung và tương tác | Phóng sự |
| Data Scrollytelling | Biểu đồ thay đổi theo câu chuyện | Báo cáo dữ liệu |
| Product Exploration | Quan sát sản phẩm theo từng giai đoạn | Công nghệ |
| 3D Storytelling | Điều khiển vật thể hoặc camera 3D | Sản phẩm 3D |
| Spatial Storytelling | Di chuyển trong không gian | Bản đồ, kiến trúc |
| Timeline Storytelling | Diễn tiến theo thời gian | Lịch sử |
| Image Sequence | Thay đổi khung hình theo vị trí cuộn | Giải thích cấu tạo |
| Video Scrollytelling | Video được điều khiển bằng scroll | Cinematic website |
| Horizontal Narrative | Nội dung di chuyển ngang | Portfolio |
| Layered Storytelling | Kết hợp nhiều lớp chiều sâu | Creative agency |
| Comparative Storytelling | So sánh trạng thái trước và sau | Sản phẩm, nghiên cứu |
| Non-linear Storytelling | Người dùng lựa chọn nhánh câu chuyện | Interactive experience |

### 3. Phân biệt các kỹ thuật
- **Scroll-triggered**: Hoạt ảnh bắt đầu khi đạt điều kiện.
- **Scroll-linked**: Tiến trình chuyển động tương ứng với tiến trình scroll.
- **Scroll-scrubbing**: Cuộn xuống để chạy tiến, cuộn lên để chạy ngược, dừng cuộn để giữ hoạt cảnh.
- **Scroll pinning**: Một đối tượng được giữ tại vị trí xác định trong lúc người dùng tiếp tục cuộn.
- **Scroll snapping**: Vị trí cuộn có thể tự căn theo các điểm được định nghĩa.
- **Scrolljacking**: Can thiệp hoặc thay thế hành vi cuộn thông thường bằng cơ chế tùy chỉnh, dễ gây mất kiểm soát cho người dùng. Không sử dụng scrolljacking như giải pháp mặc định.

---

## III. Nghiên cứu các website và hệ thống thực tế
AI phải nghiên cứu kỹ thuật, không chỉ đánh giá vẻ đẹp của website.

### 1. Nguồn tham khảo Scrollytelling
- The Pudding: https://pudding.cool
- GSAP ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- Lenis: https://lenis.dev
- Motion: https://motion.dev/docs/react-scroll-animations
- MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations
- Three.js: https://threejs.org

---

## IV. Thiết kế câu chuyện trước khi lập trình
1. Xây dựng Story Architecture: Thông điệp, hành trình, tiết lộ thông tin, điểm nhấn, CTA.
2. Story Pacing: Đoạn đọc bình thường, đoạn chuyển cảnh nhanh, đoạn nghỉ không có animation.

---

## V. Hệ thống hiệu ứng Scrollytelling
A. Typography Effects: Fade In, Slide In, Kinetic Typography, Number Counter.
B. Image Effects: Reveal, Parallax, Crossfade, Sequence, Perspective, Depth.
C. Layout Effects: Sticky Section, Pinned Section, Stacked Cards, Split Screen, Progress Navigation.
D. Cinematic Effects: Camera Zoom, Pan, Perspective Shift, Focus Pull.
E. 3D Effects: Object Rotation, Scaling, Translation, Camera Path.
F. SVG Effects: Path Drawing, Morphing, Mask.
G. Data Visualization: Animated Charts, Timelines, Maps.
H. Multimedia: Scrubbing, Canvas Frame Rendering.

---

## VI. Lựa chọn công nghệ và kiến trúc
- Fade, translate đơn giản: CSS.
- Đối tượng vào viewport: IntersectionObserver.
- Timeline phức tạp, pin, scrub: GSAP ScrollTrigger hoặc Native rAF + Spring interpolation.
- 3D: Three.js / WebGL / WebGPU.

---

## VII. Scroll Engine và tiến trình animation
Công thức chuẩn hóa tiến trình:
\[ p = \operatorname{clamp}\left(\frac{s-a}{b-a},0,1\right) \]
Lerp:
\[ \operatorname{lerp}(start, end, p) = start + (end - start) \times p \]

---

## VIII. Quy tắc bảo toàn & Checklist nghiệm thu
1. Responsive: Mobile, Tablet, Desktop.
2. Accessibility: WCAG 2.2 AA, prefers-reduced-motion.
3. Performance: Core Web Vitals (LCP <= 2.5s, INP <= 200ms, CLS <= 0.1, 60fps).
4. Error Handling & Fallback: Graceful degradation khi không có WebGL/WebGPU.
5. Code Quality: Modular, clean, reusable, no fake implementations.

END OF SKILL: SCROLLYTELLING WEBSITE MASTER

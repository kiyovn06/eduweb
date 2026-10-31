<?php
/**
 * KiyoEdu - aaPanel / PHP Environment Loader Fallback
 * Tự động nạp index.html khi hosting / aaPanel ưu tiên tệp index.php
 */
$htmlFile = __DIR__ . '/index.html';
if (file_exists($htmlFile)) {
    // Đảm bảo header UTF-8 chuẩn
    header('Content-Type: text/html; charset=UTF-8');
    readfile($htmlFile);
    exit;
} else {
    echo "Lỗi: Không tìm thấy tệp index.html trong thư mục gốc.";
}

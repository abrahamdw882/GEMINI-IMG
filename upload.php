<?php
header('Content-Type: application/json');

$uploadDir = 'uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if (isset($_FILES['image'])) {
    $file = $_FILES['image'];
    $fileName = uniqid() . '-' . basename($file['name']);
    $filePath = $uploadDir . $fileName;
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes)) {
        echo json_encode(['success' => false, 'error' => 'Invalid file type.']);
        exit;
    }
    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        
        $imageURL = 'https://' . $_SERVER['HTTP_HOST'] . '/' . $filePath;
        echo json_encode(['success' => true, 'url' => $imageURL]);
    } else {
        echo json_encode(['success' => false, 'error' => 'File upload failed.']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'No file received.']);
}
?>

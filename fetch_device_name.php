<?php
session_start();
require_once '../helper/connection.php';

$token_id = isset($_POST['deviceTokenId']) ? $_POST['deviceTokenId'] : '';

$sql = "SELECT device_name FROM token_device WHERE token_id = ?";
$stmt = $connection->prepare($sql);
$stmt->bind_param("s", $token_id);
$stmt->execute();
$result = $stmt->get_result();

$device_name = "";
if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $device_name = $row["device_name"];
}

echo $device_name;

$connection->close();
?>
<?php
$servername = "localhost";
$username = "dafm5634_ag";
$password = "Ag7us777__";
$dbname = "dafm5634_modschedule";

$name = intval($_GET['name']);

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT dept, position FROM employees WHERE name = $name";
$result = $conn->query($sql);

$details = [];
if ($result->num_rows > 0) {
    $details = $result->fetch_assoc();
}

header('Content-Type: application/json');
echo json_encode($details);

$conn->close();
?>

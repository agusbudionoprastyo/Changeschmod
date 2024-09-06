<?php
require_once 'helper/connection.php';

if (isset($_POST['token_id'])) {
    $token_id = $_POST['token_id'];

    // Memperbarui query untuk menggunakan status yang diterima dari permintaan dan mengatur regform_id menjadi 0
    $query = mysqli_query($connection, "UPDATE token_device SET regcard_id = 0 WHERE token_id = '$token_id'");

    if ($query) {
        echo "Status updated successfully";
    } else {
        echo "Failed to update status";
    }
} else {
    echo "Token ID or status not provided";
}
$connection->close();
?>
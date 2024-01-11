// Author: Wildan & Hansen

// =========================================== Mempersiapkan Websocket masing-masing robot

var ws_robot_1 = new ROSLIB.Ros({
  url: "ws://192.168.1.133:9090",
});

ws_robot_1.on("connection", function () {
  console.log("Connection made Robot 1!");
  is_robot_1_connected = 1;
});

ws_robot_1.on("close", function () {
  console.log("Connection closed Robot 1!");
  is_robot_1_connected = 0;
});

var ws_robot_2 = new ROSLIB.Ros({
  url: "ws://192.168.1.103:9090",
});

ws_robot_2.on("connection", function () {
  console.log("Connection made Robot 2!");
  is_robot_2_connected = 1;
});

ws_robot_2.on("close", function () {
  console.log("Connection closed Robot 2!");
  is_robot_2_connected = 0;
});

var ws_robot_3 = new ROSLIB.Ros({
  url: "ws://192.168.1.102:9090",
});

ws_robot_3.on("connection", function () {
  console.log("Connection made Robot 3!");
  is_robot_3_connected = 1;
});

ws_robot_3.on("close", function () {
  console.log("Connection closed Robot 3!");
  is_robot_3_connected = 0;
});

//=================================================== Global Variables

var data_to_publish = 0;
var data_buffer_from_robot = 0;
var odom_robot_1 = [30, 30, 135];
var odom_robot_2 = [50, 50, 180];
var odom_robot_3 = [100, 150, -90];

var is_robot_1_seeker = 0;
var is_robot_2_seeker = 0;
var is_robot_3_seeker = 0;

var is_robot_1_connected = 0;
var is_robot_2_connected = 0;
var is_robot_3_connected = 0;

var tempat_sembunyi_1 = 0;
var tempat_sembunyi_2 = 1;

var try_to_connect_robot_1 = 1;
var try_to_connect_robot_2 = 1;
var try_to_connect_robot_3 = 1;

// setInterval(function () {
//   if (is_robot_1_connected == 0) {
//     ws_robot_1 = new ROSLIB.Ros({
//       url: "ws://192.168.50.220:9090",
//     });
//   }
//   if (is_robot_2_connected == 0) {
//     ws_robot_2 = new ROSLIB.Ros({
//       url: "ws://192.168.50.13:9090",
//     });
//   }
//   if (is_robot_3_connected == 0) {
//     ws_robot_3 = new ROSLIB.Ros({
//       url: "ws://192.168.50.94:9090",
//     });
//   }
// }, 3000);

//=================================================== Komunikasi websocket via ROS Pub/Sub Client

var topic_to_publish_to_r1 = new ROSLIB.Topic({
  ros: ws_robot_1,
  name: "/basestation_rx",
  messageType: "std_msgs/Uint8",
});

var topic_to_subscribe_to_r1 = new ROSLIB.Topic({
  ros: ws_robot_1,
  name: "/basestation_tx",
  messageType: "std_msgs/UInt8",
});

topic_to_subscribe_to_r1.subscribe(function (message) {
  data_buffer_from_robot &= ~0b000001;
  data_buffer_from_robot |= message.data << 0x00;
});

var topic_to_subscribe_to_r1_odom = new ROSLIB.Topic({
  ros: ws_robot_1,
  name: "/odometry",
  messageType: "geometry_msgs/Pose2D",
});

topic_to_subscribe_to_r1_odom.subscribe(function (message) {
  odom_robot_1[0] = message.x;
  odom_robot_1[1] = message.y;
  odom_robot_1[2] = message.theta;
});

var topic_to_publish_to_r2 = new ROSLIB.Topic({
  ros: ws_robot_2,
  name: "/basestation_rx",
  messageType: "std_msgs/Uint8",
});

var topic_to_subscribe_to_r2 = new ROSLIB.Topic({
  ros: ws_robot_2,
  name: "/basestation_tx",
  messageType: "std_msgs/UInt8",
});

var topic_to_subscribe_to_r2_odom = new ROSLIB.Topic({
  ros: ws_robot_2,
  name: "/odometry",
  messageType: "geometry_msgs/Pose2D",
});

topic_to_subscribe_to_r2_odom.subscribe(function (message) {
  odom_robot_2[0] = message.x;
  odom_robot_2[1] = message.y;
  odom_robot_2[2] = message.theta;
});

topic_to_subscribe_to_r2.subscribe(function (message) {
  data_buffer_from_robot &= ~0b0000010;
  data_buffer_from_robot |= message.data << 0x01;
});

var topic_to_publish_to_r3 = new ROSLIB.Topic({
  ros: ws_robot_3,
  name: "/basestation_rx",
  messageType: "std_msgs/Uint8",
});

var topic_to_subscribe_to_r3 = new ROSLIB.Topic({
  ros: ws_robot_3,
  name: "/basestation_tx",
  messageType: "std_msgs/UInt8",
});

topic_to_subscribe_to_r3.subscribe(function (message) {
  data_buffer_from_robot &= ~0b00000100;
  data_buffer_from_robot |= message.data << 0x02;
});

var topic_to_subscribe_to_r3_odom = new ROSLIB.Topic({
  ros: ws_robot_3,
  name: "/odometry",
  messageType: "geometry_msgs/Pose2D",
});

topic_to_subscribe_to_r3_odom.subscribe(function (message) {
  odom_robot_3[0] = message.x;
  odom_robot_3[1] = message.y;
  odom_robot_3[2] = message.theta;
});

//=================================================== Mengirim data ke masing-masing robot

function publish_data() {
  var data = new ROSLIB.Message({
    data: data_to_publish,
  });
  topic_to_publish_to_r1.publish(data);
  topic_to_publish_to_r2.publish(data);
  topic_to_publish_to_r3.publish(data);
  console.log("Published data!", data_to_publish);
}

//=============================================== Function utils

// Ini digunakan untuk set siapa yang menjadi pencari
function set_seeker(nomor_robot) {
  if (nomor_robot == 1) {
    data_to_publish &= ~0b000111;
    data_to_publish |= 0b0001;
    is_robot_1_seeker = 1;
    is_robot_2_seeker = 0;
    is_robot_3_seeker = 0;
  } else if (nomor_robot == 2) {
    data_to_publish &= ~0b000111;
    data_to_publish |= 0b00010;
    is_robot_1_seeker = 0;
    is_robot_2_seeker = 1;
    is_robot_3_seeker = 0;
  } else if (nomor_robot == 3) {
    data_to_publish &= ~0b000111;
    data_to_publish |= 0b000100;
    is_robot_1_seeker = 0;
    is_robot_2_seeker = 0;
    is_robot_3_seeker = 1;
  }
}

// Ini digunakan untuk game start atau stop
function set_game_status(status) {
  if (status == 1) {
    data_to_publish &= ~0b0001000;
    data_to_publish |= 0b0001000;
  } else if (status == 0) {
    data_to_publish &= ~0b0001000;
  }
}

// Ini callback input keyboard
document.addEventListener("keydown", function (event) {
  switch (event.keyCode) {
    case 75: // Game start
      set_game_status(1);
      break;
    case 32: // Game stop
      set_game_status(0);
      break;
    case 81: // Robot 1 seeker
      set_seeker(1);
      odom_robot_1[0] += 10;
      odom_robot_1[1] += 10;
      break;
    case 87: // Robot 2 seeker
      set_seeker(2);
      break;
    case 69: // Robot 3 seeker
      set_seeker(3);
      break;
    case 83: // Reset seeker dan stop game
      data_to_publish = 0;
      break;
  }
  publish_data(); // Kirim data ke robot
});
// main code
//let score = 0;
let isGameStarted = false;

// Set tempat sembungi untuk robot menggunakan random
function set_tempat_sembunyi() {
  // Randomize the position of the hider 0 to 3
  tempat_sembunyi_1 = Math.floor(Math.random() * 4);

  // Randomize the position of the hider 0 to 3 but not the same as the first one
  tempat_sembunyi_2 = Math.floor(Math.random() * 4);
  while (tempat_sembunyi_2 == tempat_sembunyi_1) {
    tempat_sembunyi_2 = Math.floor(Math.random() * 4);
  }

  console.log("Random 1: " + tempat_sembunyi_1);
  console.log("Random 2: " + tempat_sembunyi_2);

  // Set the bits for the hider
  data_to_publish &= ~0b11110000;
  data_to_publish |= tempat_sembunyi_1 << 4;
  data_to_publish |= tempat_sembunyi_2 << 6;
}

document.getElementById("start-button").addEventListener("click", function () {
  console.log("Start button clicked ", isGameStarted);
  if (!isGameStarted) {
    isGameStarted = true;
    //document.getElementById('score').textContent = score;
    set_game_status(1);
    publish_data();
  }
});

document.getElementById("end-button").addEventListener("click", function () {
  console.log("end button clicked ", isGameStarted);
  if (isGameStarted) {
    isGameStarted = false;
    set_game_status(0);
    publish_data();
  }
});

document
  .getElementById("confirm-seeker")
  .addEventListener("click", function () {
    var nomor_robot = parseInt(
      document.getElementById("seeker-input").value,
      10
    );
    if (nomor_robot >= 1 && nomor_robot <= 3) {
      set_seeker(nomor_robot);
    } else {
      alert("Please enter a valid seeker number (1-3)");
    }
    set_tempat_sembunyi();
    publish_data();
  });

// Function to update score - Call this function to update the score
//function updateScore(points) {
//  if (isGameStarted) {
//    score += points;
//  document.getElementById('score').textContent = score;
// }

//}

const canvas_height = 985;
const canvas_width = 742.5;

// Transformer
function cm2px_x(x) {
  return x * 5;
}
function cm2px_y(y) {
  return y * 5;
}

function px2cm_x(x) {
  return x / 5;
}

function px2cm_y(y) {
  return y / 5;
}

// Ini akan membuat game auto berhenti ketika semua robot telah ditemukan
setInterval(function () {
  if (data_buffer_from_robot > 0) {
    data_to_publish &= ~0b0001000;
    isGameStarted = false;
    publish_data();
  }
}, 20);

// Ini akan menggambar semua elemen yang ada di canvas
document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("world_model");
  const ctx = canvas.getContext("2d");

  setInterval(function () {
    ctx.clearRect(0, 0, canvas.height, canvas.width);
    ctx.fillStyle = "#c0c0c0"; // Gray color for the field
    ctx.fillRect(0, 0, canvas.height, canvas.width);

    // Draw the field lines
    init_map(ctx);

    drawCircle(ctx, cm2px_x(42), cm2px_y(61.5), 20, "yellow");
    drawCircle(ctx, cm2px_x(114.5), cm2px_y(57.5), 20, "yellow");
    drawCircle(ctx, cm2px_x(48), cm2px_y(136), 20, "yellow");
    drawCircle(ctx, cm2px_x(117), cm2px_y(139.5), 20, "yellow");

    drawCircle(ctx, cm2px_x(0), cm2px_y(0), 15, "blue");
    drawCircle(ctx, cm2px_x(62), cm2px_y(0), 15, "blue");
    drawCircle(ctx, cm2px_x(99), cm2px_y(0), 15, "blue");
    drawCircle(ctx, cm2px_x(0), cm2px_y(39.4), 15, "blue");
    drawCircle(ctx, cm2px_x(62), cm2px_y(39.4), 15, "blue");
    drawCircle(ctx, cm2px_x(99), cm2px_y(39.4), 15, "blue");
    drawCircle(ctx, cm2px_x(0), cm2px_y(78.8), 15, "blue");
    drawCircle(ctx, cm2px_x(62), cm2px_y(78.8), 15, "blue");
    drawCircle(ctx, cm2px_x(99), cm2px_y(78.8), 15, "blue");
    drawCircle(ctx, cm2px_x(0), cm2px_y(118.2), 15, "blue");
    drawCircle(ctx, cm2px_x(62), cm2px_y(118.2), 15, "blue");
    drawCircle(ctx, cm2px_x(99), cm2px_y(118.2), 15, "blue");
    drawCircle(ctx, cm2px_x(0), cm2px_y(157.6), 15, "blue");
    drawCircle(ctx, cm2px_x(62), cm2px_y(157.6), 15, "blue");
    drawCircle(ctx, cm2px_x(99), cm2px_y(157.6), 15, "blue");

    drawCircle(ctx, cm2px_x(62), cm2px_y(39.4), 15, "blue");
    drawCircle(ctx, cm2px_x(99), cm2px_y(39.4), 15, "blue");
    drawCircle(ctx, cm2px_x(148.5), cm2px_y(39.4), 15, "blue");
    drawCircle(ctx, cm2px_x(62), cm2px_y(78.8), 15, "blue");
    drawCircle(ctx, cm2px_x(99), cm2px_y(78.8), 15, "blue");
    drawCircle(ctx, cm2px_x(148.5), cm2px_y(78.8), 15, "blue");
    drawCircle(ctx, cm2px_x(62), cm2px_y(118.2), 15, "blue");
    drawCircle(ctx, cm2px_x(99), cm2px_y(118.2), 15, "blue");
    drawCircle(ctx, cm2px_x(148.5), cm2px_y(118.2), 15, "blue");
    drawCircle(ctx, cm2px_x(62), cm2px_y(157.6), 15, "blue");
    drawCircle(ctx, cm2px_x(99), cm2px_y(157.6), 15, "blue");
    drawCircle(ctx, cm2px_x(148.5), cm2px_y(157.6), 15, "blue");
    drawCircle(ctx, cm2px_x(62), cm2px_y(197), 15, "blue");
    drawCircle(ctx, cm2px_x(99), cm2px_y(197), 15, "blue");
    drawCircle(ctx, cm2px_x(148.5), cm2px_y(197), 15, "blue");

    if (is_robot_1_connected == 1) {
      drawRobot(
        ctx,
        odom_robot_1[0],
        odom_robot_1[1],
        odom_robot_1[2],
        "red",
        is_robot_1_seeker
      );
    }

    if (is_robot_2_connected == 1) {
      drawRobot(
        ctx,
        odom_robot_2[0],
        odom_robot_2[1],
        odom_robot_2[2],
        "green",
        is_robot_2_seeker
      );
    }

    if (is_robot_3_connected == 1) {
      drawRobot(
        ctx,
        odom_robot_3[0],
        odom_robot_3[1],
        odom_robot_3[2],
        "blue",
        is_robot_3_seeker
      );
    }
  }, 20);
  ctx.translate(0, canvas.height);
  ctx.rotate(-Math.PI / 2);

  const canvas2 = document.getElementById("game_state");
  const ctx2 = canvas2.getContext("2d");

  setInterval(function () {
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

    // Set text properties
    ctx2.font = "40px Arial";
    ctx2.textAlign = "center";
    ctx2.textBaseline = "middle";

    if (isGameStarted == true) {
      ctx2.fillStyle = "green";
      ctx2.fillText("GAME STARTED", canvas2.width / 2, canvas2.height / 2);
    } else {
      ctx2.fillStyle = "red";
      ctx2.fillText("GAME STOPPED", canvas2.width / 2, canvas2.height / 2);
    }
  }, 20);
});

function init_map(ctx) {
  drawLine(ctx, { x: 31, y: 197 - 44 }, { x: 31, y: 197 - 78.7 }, "white", 8);
  drawLine(
    ctx,
    { x: 31, y: 197 - 78.7 },
    { x: 67.1, y: 197 - 78.7 },
    "white",
    8
  );
  drawLine(
    ctx,
    { x: 100, y: 197 - 40.5 },
    { x: 134.3, y: 197 - 40.5 },
    "white",
    8
  );
  drawLine(
    ctx,
    { x: 134.3, y: 197 - 40.5 },
    { x: 134.3, y: 197 - 75.2 },
    "white",
    8
  );
  drawLine(
    ctx,
    { x: 132, y: 197 - 157.5 },
    { x: 132, y: 197 - 122.3 },
    "white",
    8
  );
  drawLine(
    ctx,
    { x: 132, y: 197 - 157.5 },
    { x: 97.5, y: 197 - 157.5 },
    "white",
    8
  );
  drawLine(
    ctx,
    { x: 97.5, y: 197 - 157.5 },
    { x: 97.5, y: 197 - 122.3 },
    "white",
    8
  );
  drawLine(
    ctx,
    { x: 24, y: 197 - 152.5 },
    { x: 60, y: 197 - 152.5 },
    "white",
    8
  );
  drawLine(ctx, { x: 60, y: 197 - 152.5 }, { x: 60, y: 197 - 118 }, "white", 8);
}

function drawCircle(context, x, y, radius, color) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(y, x, radius, 0, 2 * Math.PI);
  context.fill();
  context.closePath();
}

function drawLine(context, startPoint, endPoint, color, lineWidth) {
  context.strokeStyle = color;
  context.lineWidth = lineWidth;

  const x1_scaled = cm2px_x(startPoint.y);
  const y1_scaled = cm2px_y(startPoint.x);
  const x2_scaled = cm2px_x(endPoint.y);
  const y2_scaled = cm2px_y(endPoint.x);

  context.beginPath();
  context.moveTo(x1_scaled, y1_scaled);
  context.lineTo(x2_scaled, y2_scaled);
  context.stroke();
}

function drawRobot(ctx, x, y, yaw, color, is_seeker) {
  const x_scaled = cm2px_x(y);
  const y_scaled = cm2px_y(x);

  ctx.beginPath();
  ctx.arc(x_scaled, y_scaled, 30, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();

  if (is_seeker == 1) {
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#FFFF";
  } else {
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = "#000";
  }

  ctx.stroke();

  // Draw a line indicating the orientation of the robot
  const angle = yaw; // Change this angle based on the orientation
  const lineLength = 30;
  const dx = lineLength * Math.sin(angle * (Math.PI / 180));
  const dy = lineLength * Math.cos(angle * (Math.PI / 180));

  ctx.beginPath();
  ctx.moveTo(x_scaled, y_scaled);
  ctx.lineTo(x_scaled + dx, y_scaled + dy);
  ctx.strokeStyle = "white";
  ctx.stroke();
}

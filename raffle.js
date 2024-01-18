// raffle.js 處理前端
// author a9202507@gmail.com
let participants = []; //建立一個array，類似於python list 物件 存於未中獎人員名單
let gifts = []; //建立array , 存放未抽出之獎品
let winners = []; //建立 array ，存放中獎人員的名單
var total_winner = 0;
var winner = [];
let currentGift = [];

//函式 readFile 傳入 人員檔案或禮物檔案，由isGift決定要存入到那一個array，供後續使用。
function readFile(input, isGift) {
  const file = input.files[0]; // input 為使用者傳入的複數檔案 此處只選用傳入的第一個檔案
  const reader = new FileReader(); //使用 javascript 的FileRader物件
  //document.getElementById("confirmRaffle-button").disabled = true; //將網頁上的確認按鈕 暫時取消點擊功能

  reader.onload = function (event) {
    //event 在此為line24 reader.readAsText(file)所觸發的load 事件
    const text = event.target.result; // event.target.result 在為是指載入的文件的內容，並存入text中
    if (isGift) {
      gifts = csvToArray(text, true); //若呼叫時 告知跟禮物有關 則將檔案存入gift array中
      updateAvailablePrizesList();
    } else {
      participants = csvToArray(text, false); //將檔案存入participants array之中
      updateEligibleParticipantsList();
    }
  };

  reader.readAsText(file); // 產生event 觸發line13的onliad操作 此為建議之寫法
}

//csv to array 函式
function csvToArray(csvString, isGift) {
  const rows = csvString.trim().split("\n").slice(1);
  var csvToArrayResult = rows.map((row, index) => {
    // index is the line number starting from 0
    try {
      const cells = row.split(",");
      if (cells[0].trim() === "") {
        throw new Error("Name field is empty");
      }

      if (isGift) {
        return {
          name: cells[0].trim(),
          quantity: parseInt(cells[1], 10),
        };
      } else {
        return {
          name: cells[0].trim(),
          email: cells[1].trim(),
          departmentName: cells[2].trim(),
          hasWon: cells[3].trim(),
          timeStamp: cells[4].trim(),
        };
      }
    } catch (error) {
      // Log the error with the line number. Note that index starts from 0, so add 1 to represent the actual line number.
      //console.error(`Error in line ${index + 2}: ${row}. Error message: ${error.message}`);

      const errorModalElement = document.getElementById("errorModal"); //綁定index.html下的errorModal元件
      const errorModalMessageElement =
        document.getElementById("errorModalMessage"); //綁定index.html下的errorModalMessage元件

      //設置彈出視窗的錯誤訊息

      errorModalMessageElement.textContent = `csv檔異常，請確認人員.csv第一行欄位數量至少五欄。也請檢查第 ${
        index + 2
      }行的資料，是否有空白欄位存在.`;

      const errorModal = new bootstrap.Modal(errorModalElement); //顯示錯誤彈出視窗
      errorModal.show();
      // Return null or an error object for that row
      return { error: `Line ${index + 2}: ${error.message}` };
    }
  });

  // This will include rows with errors in the result, marked with an error property.
  return csvToArrayResult;
}

function updateEligibleParticipantsList() {
  const list = document.getElementById("eligibleParticipantsList"); //將 網頁元件 eligibleParticipantsList 綁定到此
  list.innerHTML = ""; // 把列表元件清空
  let total = 0; //計算參加人數
  // forEach 是array 的迖代方法的一種。
  participants.forEach((participant) => {
    if (!participant.hasWon) {
      //挑出未中獎的人員
      const listItem = document.createElement("li"); //建立一個html的清單元件(li) , 表格的話，則是tr(table row) and td(table data)
      listItem.className = "list-group-item"; //將列表元件套用Boostrap的樣式
      listItem.textContent = `${participant.name} (${participant.email})`; //設定列表的內容
      list.appendChild(listItem); // 將名單 渲染到網頁上
      total++; // 用來統計參加人數有幾個
    }
  });

  document.getElementById("totalParticipants").textContent = total; //將參加人數投放到網頁
  // 調用函數以查找和顯示重複項

  if (total === 0) {
    raffleCloseMessage("抽獎結束", "可抽獎人員不足");
    document.getElementById("startRaffle-button").disabled = true; // 關閉抽獎跟洗牌按鈕
  }

  findDuplicates();
}
//更新可抽禮物清單到網頁
function updateAvailablePrizesList() {
  const list = document.getElementById("availablePrizesList"); // 將 網頁元件availablePrizesList綁定到此
  var gift_total = 0; //設定禮物計數器初始值
  list.innerHTML = ""; //清空列表元件
  gifts.forEach((gift) => {
    //迖代
    if (gift.quantity > 0) {
      //禮物數量不為零 才開始做
      const listItem = document.createElement("li"); //建立html 的清單元件(li)
      listItem.className = "list-group-item"; //並套用boostrap的樣式
      listItem.textContent = `${gift.name} (剩餘數量: ${gift.quantity})`; //設定列表內容
      list.appendChild(listItem); //將名單渲染到網頁上
      gift_total = gift_total + gift.quantity; //計算總共可抽數量
    }
  });
  document.getElementById("totalPrizes").textContent = gift_total; //將可抽數量渲染到網頁上
}

function updateWinnersList() {
  //更新中獎者名單放到網頁上
  const tableBody = document
    .getElementById("winnersList")
    .querySelector("tbody"); //將網頁元件winnersList下的tbody表格綁定到此

  tableBody.innerHTML = ""; //重設此html網頁元件
  winners.forEach((winner) => {
    //開始迖代
    const row = tableBody.insertRow(); //在html元件插入一行
    const nameCell = row.insertCell(0); //建立三個欄位
    const emailCell = row.insertCell(1);
    const departmentCell = row.insertCell(2);
    const prizeCell = row.insertCell(3);
    //const timestampCell = row.insertCell(4);
    nameCell.textContent = winner.name; //代入中獎者名字及獎項
    emailCell.textContent = winner.email;
    prizeCell.textContent = winner.prize;
    departmentCell.textContent = winner.department;
    //timestampCell.textContent = winner.timestamp; //代入中獎時間
  });
}

function startRaffle() {
  //準備開始抽獎
  //檢查是否上傳人員.csv  獎品.csv
  if (participants.length === 0 || gifts.length === 0) {
    //若有一個名單沒上傳，則準備錯誤訊息
    const errorModalElement = document.getElementById("errorModal"); //綁定index.html下的errorModal元件
    const errorModalMessageElement =
      document.getElementById("errorModalMessage"); //綁定index.html下的errorModalMessage元件

    //設置彈出視窗的錯誤訊息
    if (participants.length === 0 && gifts.length === 0) {
      errorModalMessageElement.textContent = "需先上傳人員名單和獎品清單。";
    } else if (participants.length === 0) {
      errorModalMessageElement.textContent = "需先上傳人員名單。";
    } else if (gifts.length === 0) {
      errorModalMessageElement.textContent = "需先上傳獎品清單。";
    }

    const errorModal = new bootstrap.Modal(errorModalElement); //顯示錯誤彈出視窗
    errorModal.show();
  } else {
    performRaffle((index = 0)); //若人員.csv and 獎品.csv都上傳，則執行performraffle函式
  }
}

function performRaffle(index) {
  document.getElementById("startRaffle-button").disabled = true; //執行後，將洗牌按接鈕跟確認按鈕取消點選功能，做介面的防呆
  document.getElementById("randomSorting-button").disabled = true;

  sortEligibleParticipantsListByRandom();

  const eligibleParticipants = participants.filter((p) => !p.hasWon); //篩選函式filter, 把participants裡面 haswon不為真的人名拉出來。 // !p.hasWon的! 是 log gate NOT 的操作
  currentGift = gifts.find((g) => g.quantity > 0); //找到第一個禮物數量大於零的禮物，拿出來抽獎。
  var eligibleParticipantsElements = document.getElementById(
    "eligibleParticipantsList"
  ).children; //將html中可參加抽獎的人員列表，全部綁定到 eligibleParticipantsElements
  //var index = 0;

  //對人員列表，輪流高亮
  const intervalId = setInterval(function () {
    // 建立intervalID 物件，執行serInterval函式
    index = (index + 1) % eligibleParticipantsElements.length;
    for (var i = 0; i < eligibleParticipantsElements.length; i++) {
      eligibleParticipantsElements[i].style.backgroundColor =
        i === index ? "yellow" : "";
    }

    //讓視窗跟著游標跑
    eligibleParticipantsElements[index].scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, 200);

  var maxRunningTime =
    parseInt(document.getElementById("drawSecondvalueMax").value, 10) * 1000;
  var minRunningTime =
    parseInt(document.getElementById("drawSecondvalueMin").value, 10) * 1000;
  //const during_time = Math.floor(Math.random() * maxRunningTime); // 生成5到10秒之間的隨機時間
  const during_time =
    Math.floor(Math.random() * (maxRunningTime - minRunningTime + 1)) +
    minRunningTime;
  console.log(during_time);

  const slowDownTime = during_time - 1000; // 設置第二段時間點並減慢輪流高亮的速度

  setTimeout(() => {
    clearInterval(intervalId); // 停止間隔
    handleStoppedHighlighting(index); // 輸出當前的人員index，並由下一個函式接手
  }, during_time);

  /*
  if (eligibleParticipants.length === 0) {
    // 若沒有未中獎人員，或沒有獎品了，則無法再抽獎
    document.getElementById("result").innerHTML = "沒有更多人可以參加抽獎了！";
    return;
  }

  if (!currentGift) {
    document.getElementById("result").innerHTML = "所有獎品都抽完了！";
    return;
  }
  */

  return index;
}

function handleStoppedHighlighting(currentIndex) {
  //處理中獎當下的操作邏輯

  const eligibleParticipants = participants.filter((p) => !p.hasWon); //進版可以考慮拿掉
  currentGift = gifts.find((g) => g.quantity > 0); //進版可以考慮拿掉
  var eligibleParticipantsElements = document.getElementById(
    "eligibleParticipantsList"
  ).children; //進版可以考慮拿掉
  eligibleParticipantsElements[currentIndex].style.backgroundColor = "orange"; //將中獎者高亮色彩從前一個函式設定的值 改成此行的顏色，確認已經中獎
  winner = eligibleParticipants[currentIndex]; //設定winner 設為當次中獎人
  const winnerModalBody = document.querySelector("#winnerModal .modal-body"); //綁定彈出視窗的內容
  //winnerModalBody.textContent = `恭喜 \n${winner.departmentName} 部門,${winner.name}獲得 ${currentGift.name}！`; //設定彈出視窗的訊息，並連動中動人資訊
  winnerModalBody.innerHTML = `恭喜 <span style="color: red;">${winner.departmentName}</span> 部門<br><strong><span style="color: blue;">${winner.name}</span></strong> 獲得 ${currentGift.name}！`;

  const winnerModal = new bootstrap.Modal(
    document.getElementById("winnerModal")
  ); //綁定彈出視窗
  winnerModal.show(); //顯示彈出視窗

  /*
  winner.hasWon = true; //將該中獎人設為已中獎
  currentGift.quantity -= 1; //減少當前獎項的數量
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-"); //設定得獎時間標記
  winners.push({
    //將winner的資料，加入到winners之中
    name: winner.name,
    email: winner.email,
    department: winner.departmentName,
    prize: currentGift.name,
    timestamp: timestamp,
    
  });
  */
  //updateParticipantWinStatus(participants, winner.email, currentGift.name);

  //document.getElementById("confirmRaffle-button").disabled = false; //抽獎完成後，啟動confirm 按鈕，用做UI流程控制。
}

function updateParticipantWinStatus(participants, findTheEmailText, prizeName) {
  // Step 1: Find the participant in the array
  let participant = participants.find((p) => p.email === findTheEmailText);

  // Step 2: Check if the participant was found
  if (participant) {
    // Step 3: Update the hasWon property
    participant.hasWon = prizeName;
    participant.timeStamp = new Date().toISOString().replace(/[:.]/g, "-");
    console.log(
      `Participant ${findTheEmailText} hasWon status updated to ${prizeName}`
    );
  } else {
    // Step 4: Handle the participant not found
    console.log(`Participant with name ${findTheEmailText} not found.`);
  }
}

//當name.csv 檔名出現時，執行readFile函式
document
  .getElementById("namesFile")
  .addEventListener("change", function (event) {
    readFile(event.target, false);
  });
//當gift.csv 檔名出現時，執行readFile函式
document
  .getElementById("giftsFile")
  .addEventListener("change", function (event) {
    readFile(event.target, true);
  });

function downloadResultCSV() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-"); //輸出 2023-12-23T19-30-25-000Z 格式的時間戳記
  const main_title = document.getElementById("main_title").value; //取回網頁上活動標題的內文
  const filename = `${main_title}_result_${timestamp}.csv`; //設定存檔檔名為 活動標題加上時間戳記

  let bom = "\uFEFF"; // UTF-8 的 BOM
  let csvContent = "data:text/csv;charset=utf-8," + bom; // UTF-8 的 BOM
  csvContent += "Name,ID,department,Prize,Timestamp\r\n"; // 在CSV的第一行，設置Name,Prize,Timestamp

  participants.forEach(function (participant) {
    csvContent += `${participant.name},${participant.email},${participant.departmentName},${participant.hasWon},${participant.timeStamp},\r\n`;
  });
  downloadCSV(filename, csvContent);
}

/*function downloadWinnersCSV() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-"); //輸出 2023-12-23T19-30-25-000Z 格式的時間戳記
  const main_title = document.getElementById("main_title").value; //取回網頁上活動標題的內文
  const filename = `${main_title}_Winners_${timestamp}.csv`; //設定存檔檔名為 活動標題加上時間戳記

  let bom = "\uFEFF"; // UTF-8 的 BOM
  let csvContent = "data:text/csv;charset=utf-8," + bom; // UTF-8 的 BOM
  csvContent += "Name,ID,department,Prize,Timestamp\r\n"; // 在CSV的第一行，設置Name,Prize,Timestamp
  winners.forEach(function (winner) {
    csvContent += `${winner.name},${winner.email},${winner.department},${winner.prize},${winner.timestamp}\r\n`; //將winners 內容迖代進csvContent之前
  });
  downloadCSV(filename, csvContent);
}*/

// 等待DOM載入完畢
document.addEventListener("DOMContentLoaded", (event) => {
  // 通過ID選擇按鈕並綁定click事件
  const confrimModalButton = document.getElementById(
    "confirmWinnerModalButton"
  );
  confrimModalButton.addEventListener("click", confirmRaffle);
});

document.addEventListener("DOMContentLoaded", (event) => {
  // 通過ID選擇按鈕並綁定click事件
  const cancelModalButton = document.getElementById("cancelWinnerModalButton");
  cancelModalButton.addEventListener("click", cancelRaffle);
});

function confirmRaffle() {
  currentGift.quantity -= 1; //減少當前獎項的數量
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-"); //設定得獎時間標記
  winners.push({
    //將winner的資料，加入到winners之中
    name: winner.name,
    email: winner.email,
    department: winner.departmentName,
    prize: currentGift.name,
    timestamp: timestamp,
  });
  total_winner++; //抽獎完後，將中獎人數+1
  updateParticipantWinStatus(participants, winner.email, currentGift.name);
  //設定按下確認接鈕後的動作，做為UI流程控制
  document.getElementById("startRaffle-button").disabled = false; //啟用抽獎跟洗牌按鈕
  //document.getElementById("confirmRaffle-button").disabled = true;
  document.getElementById("randomSorting-button").disabled = false;
  window.scroll(0, 0);

  updateEligibleParticipantsList(); //刷新可抽獎人員/可抽禮物/中獎人員名單
  updateAvailablePrizesList();
  updateWinnersList();
  checkAndToggleRaffleButton();
  document.getElementById("totalWinner").textContent = total_winner; //更新中獎總人數
}

function cancelRaffle() {
  document.getElementById("startRaffle-button").disabled = false; //啟用抽獎跟洗牌按鈕
  document.getElementById("randomSorting-button").disabled = false;
  window.scroll(0, 0);
  updateParticipantWinStatus(participants, winner.email, "give up"); //中獎人放棄
  sortEligibleParticipantsListByRandom();
}

/*function downloadNotWinnersCSV() {
  //操作邏輯同前
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const main_title = document.getElementById("main_title").value;
  const filename = `${main_title}_notWinner_${timestamp}.csv`;

  let bom = "\uFEFF";
  let csvContent = "data:text/csv;charset=utf-8," + bom;
  csvContent += "Name,id,department,prize,timestamp\r\n"; // CSV頭部

  //const notWinners = participants.filter((p) => !p.hasWon);
  participants.forEach(function (participant) {
    csvContent += `${participant.name},${participant.email},${participant.departmentName},${participant.hasWon},${participant.timeStamp},\r\n`;
  });

  downloadCSV(filename, csvContent);
} */

function downloadCSV(filename, csvContent) {
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function sortEligibleParticipantsListByRandom() {
  //執行洗牌動作
  participants.sort(function (a, b) {
    return Math.random() > 0.5 ? -1 : 1;
  });

  updateEligibleParticipantsList();
}

//document.getElementById("confirmRaffle-button").addEventListener("click", confirmRaffle);
document
  .getElementById("randomSorting-button")
  .addEventListener("click", sortEligibleParticipantsListByRandom);

// 函數用於查找重複的姓名和信箱
function findDuplicates() {
  let nameMap = {}; // 用於記錄名字
  let emailMap = {}; // 用於記錄信箱
  let duplicates = { names: [], emails: [] }; // 用於儲存重複的名字和信箱

  participants.forEach((participant) => {
    // 檢查名字是否重複
    if (nameMap[participant.name]) {
      duplicates.names.push(participant); // 如果名字已存在，推入重複名單
    } else {
      nameMap[participant.name] = true; // 否則記錄該名字
    }

    // 檢查信箱是否重複
    if (emailMap[participant.email]) {
      duplicates.emails.push(participant); // 如果信箱已存在，推入重複名單
    } else {
      emailMap[participant.email] = true; // 否則記錄該信箱
    }
  });

  // 顯示重複的名字和信箱
  displayDuplicates(duplicates);

  // 返回重複項數組以備進一步處理
  return duplicates;
}

// 函數用於在頁面上顯示重複項
function displayDuplicates(duplicates) {
  // 假設頁面上有兩個列表用於顯示重複的名字和信箱
  const nameList = document.getElementById("duplicateNamesList");
  const emailList = document.getElementById("duplicateEmailsList");

  // 清空列表
  nameList.innerHTML = "";
  emailList.innerHTML = "";

  // 顯示重複的名字
  duplicates.names.forEach((duplicate) => {
    const listItem = document.createElement("li");
    listItem.className = "list-group-item"; // 添加 Bootstrap 列表項樣式
    listItem.textContent = `${duplicate.name}`;
    nameList.appendChild(listItem);
  });

  // 獲取顯示重複姓名數量的徽章元素
  const duplicateNamesCount = document.getElementById("duplicateNamesCount");

  if (duplicates.names.length === 0) {
    duplicateNamesCount.style.display = "inline-block"; // 使徽章可見
    // 如果沒有重複項，顯示綠色打勾圖示
    duplicateNamesCount.className = "badge bg-success rounded-pill";
    // 使用 Bootstrap Icons 或其他圖示庫的圖示類（如下面範例使用了 Font Awesome）
    duplicateNamesCount.innerHTML =
      '<i class="fa fa-check" aria-hidden="true"></i>';
  } else {
    // 如果有重複項，顯示紅色徽章並顯示數量
    duplicateNamesCount.style.display = "inline-block"; // 使徽章可見
    duplicateNamesCount.className = "badge bg-danger rounded-pill";
    duplicateNamesCount.textContent = duplicates.names.length;
  }

  // 顯示重複的信箱
  duplicates.emails.forEach((duplicate) => {
    const listItem = document.createElement("li");
    listItem.className = "list-group-item"; // 添加 Bootstrap 列表項樣式
    listItem.textContent = `${duplicate.email}`;
    emailList.appendChild(listItem);
  });

  // 獲取顯示重複Email數量的徽章元素
  const duplicateEmailCount = document.getElementById("duplicateEmailCount");

  if (duplicates.emails.length === 0) {
    duplicateEmailCount.style.display = "inline-block"; // 使徽章可見
    // 如果沒有重複項，顯示綠色打勾圖示
    duplicateEmailCount.className = "badge bg-success rounded-pill";
    // 使用 Bootstrap Icons 或其他圖示庫的圖示類（如下面範例使用了 Font Awesome）
    duplicateEmailCount.innerHTML =
      '<i class="fa fa-check" aria-hidden="true"></i>';
  } else {
    // 如果有重複項，顯示紅色徽章並顯示數量
    duplicateEmailCount.style.display = "inline-block"; // 使徽章可見
    duplicateEmailCount.className = "badge bg-danger rounded-pill";
    duplicateEmailCount.textContent = duplicates.emails.length;
  }
}

// 搜索功能實現
function searchParticipant() {
  var input, filter, ul, li, i, txtValue;
  input = document.getElementById("searchInput");
  filter = input.value.toUpperCase();
  ul = document.getElementById("searchResults");
  ul.innerHTML = ""; // 清空之前的搜索結果

  // 遍歷參與者數據來尋找匹配項
  for (i = 0; i < participants.length; i++) {
    txtValue = participants[i].name;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      const listItem = document.createElement("li");
      listItem.className = "list-group-item";
      listItem.textContent = `${participants[i].name} (${participants[i].email})`;
      if (participants[i].hasWon == 0) {
        ul.appendChild(listItem);
      }
    }
  }
}

// 轉換時區
Date.prototype.toISOString = function () {
  let pad = (n) => (n < 10 ? "0" + n : n);
  let hours_offset = this.getTimezoneOffset() / 60;
  let offset_date = this.setHours(this.getHours() - hours_offset);
  let symbol = hours_offset >= 0 ? "-" : "+";
  let time_zone = symbol + pad(Math.abs(hours_offset)) + ":00";

  return (
    this.getUTCFullYear() +
    "-" +
    pad(this.getUTCMonth() + 1) +
    "-" +
    pad(this.getUTCDate()) +
    "T" +
    pad(this.getUTCHours()) +
    ":" +
    pad(this.getUTCMinutes()) +
    ":" +
    pad(this.getUTCSeconds()) +
    "." +
    (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
    time_zone
  );
};

// 限制輸入時間欄位的格式
// 獲取A和B的輸入框和X按鈕元素
const inputA = document.getElementById("drawSecondvalueMin");
const inputB = document.getElementById("drawSecondvalueMax");
const buttonX = document.getElementById("startRaffle-button");

// 添加事件監聽器
inputA.addEventListener("input", checkInputs);
inputB.addEventListener("input", checkInputs);

// 檢查輸入框的值並更新按鈕狀態
function checkInputs() {
  const valueA = Number(drawSecondvalueMin.value);
  const valueB = Number(drawSecondvalueMax.value);

  // 檢查A和B的值是否為數字，如果不是，則禁用按鈕
  if (isNaN(valueA) || isNaN(valueB)) {
    buttonX.disabled = true;
    return;
  }

  // 檢查A是否小於B，如果是，則啟用按鈕，否則禁用按鈕
  if (valueA < valueB) {
    buttonX.disabled = false;
  } else {
    buttonX.disabled = true;
  }
}

function checkAndToggleRaffleButton() {
  // 檢查是否有可抽獎的人員和禮物
  const canRaffle =
    participants.length > 0 && gifts.some((gift) => gift.quantity > 0);

  // 獲取開始抽獎按鈕元素
  const startRaffleButton = document.getElementById("startRaffle-button");

  // 根據條件啟用或禁用開始抽獎按鈕
  if (canRaffle === false) {
    startRaffleButton.disabled = true;
  }
}

function raffleCloseMessage(messageTitle, message) {
  const errorModalElement = document.getElementById("errorModal"); //綁定index.html下的errorModal元件
  const errorModalElementTitle = document.getElementById("errorModalTitle");
  const errorModalMessageElement = document.getElementById("errorModalMessage"); //綁定index.html下的errorModalMessage元件

  //設置彈出視窗的錯誤訊息
  errorModalElementTitle.textContent = messageTitle;
  errorModalMessageElement.textContent = message;

  const errorModal = new bootstrap.Modal(errorModalElement); //顯示錯誤彈出視窗
  errorModal.show();
}

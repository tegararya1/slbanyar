const stepContent = document.getElementById("stepContent");
const stepIndicator = document.getElementById("stepIndicator");

let currentStep = 1;
let selectedKambing = null;
let currentDateKey = todayKey();
let editKambingIndex = null;
let hapusKambingIndex = null;
let hapusLaporanIndex = null;
let currentPinTarget = null;

// DATA KAMBING
let kambings = JSON.parse(localStorage.getItem("kambings")) || ["Kambing 1","Kambing 2","Kambing 3","Kambing 4","Kambing 5"];
function saveKambings(){ localStorage.setItem("kambings", JSON.stringify(kambings)); }

// LOCAL STORAGE LAPORAN 
function todayKey(){ return new Date().toISOString().split("T")[0]; }
function getLaporanHari(key = todayKey()){ return JSON.parse(localStorage.getItem("laporanPangan_" + key)) || []; }
function saveLaporanHari(data, key = todayKey()){ localStorage.setItem("laporanPangan_" + key, JSON.stringify(data)); }
let laporanData = getLaporanHari(currentDateKey);

//  MODAL HELPERS
function openModal(id){ document.getElementById(id).classList.remove("hidden"); }
function closeModal(id){ document.getElementById(id).classList.add("hidden"); }

// RENDER STEP INDICATOR
function renderStepIndicator(){
  const steps = ["Pilih Kambing","Centang Makan","Laporan","Laporan Semua"];
  stepIndicator.innerHTML = steps.map((s,i)=>`
    <div class="step ${currentStep===i+1?'active':''}">${i+1}. ${s}</div>
  `).join("");
}

//  RENDER STEP 
function renderStep(){
  renderStepIndicator();

  // STEP 1
  if(currentStep === 1){
    const counts = kambings.map(k=>({ nama:k, jumlah: laporanData.filter(d=>d.nama===k).length }));

    stepContent.innerHTML = `
      <div class="bg-white p-6 rounded-2xl shadow-md text-center mb-6">
        <h2 class="text-lg font-semibold mb-4">Keterangan Warna Status</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 rounded-xl border-2 border-red-400 bg-red-100">
            <div class="text-5xl mb-2">🐐</div>
            <p class="font-bold text-red-600">MERAH</p>
            <p>Belum makan</p>
          </div>
          <div class="p-4 rounded-xl border-2 border-yellow-400 bg-yellow-100">
            <div class="text-5xl mb-2">🐐</div>
            <p class="font-bold text-yellow-600">KUNING</p>
            <p>Sudah makan 1x</p>
          </div>
          <div class="p-4 rounded-xl border-2 border-green-400 bg-green-100">
            <div class="text-5xl mb-2">🐐</div>
            <p class="font-bold text-green-600">HIJAU</p>
            <p>Sudah makan 2x</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-md text-center">
        <h2 class="text-lg font-semibold mb-4">Pilih Kambing</h2>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          ${counts.map(c=>{
            let warna = "bg-red-100 border-red-400 text-red-700"; 
            if(c.jumlah===1) warna = "bg-yellow-100 border-yellow-400 text-yellow-700"; 
            if(c.jumlah>=2) warna = "bg-green-100 border-green-400 text-green-700";
            const isSelected = selectedKambing === c.nama ? "ring-4 ring-blue-400" : "";
            return `
              <div onclick="selectKambing('${c.nama}')"
                   class="cursor-pointer p-4 rounded-xl shadow-md border-2 ${warna} ${isSelected} hover:opacity-80 transition">
                <div class="text-5xl mb-2">🐐</div>
                <p class="font-bold">${c.nama}</p>
                <p>${c.jumlah>0?`${c.jumlah}x makan`:"Belum makan"}</p>
              </div>
            `;
          }).join("")}
        </div>
        <div class="flex justify-between">
          <button onclick="openPinModal('kambing')" class="bg-gray-800 text-white px-4 py-2 rounded-lg">Kelola Kambing</button>
          <button onclick="goNext()" class="bg-blue-600 text-white px-6 py-2 rounded-lg">Lanjut ke Centang Makan</button>
        </div>
      </div>
    `;
  }

  // STEP 2
  else if(currentStep === 2){
    stepContent.innerHTML = `
      <div class="bg-white p-6 rounded-2xl shadow-md text-center">
        <h2 class="text-lg font-semibold mb-6">Centang Makan Kambing</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div onclick="goBackKambing()"
               class="cursor-pointer p-6 rounded-xl border-2 bg-red-100 border-red-500 hover:bg-red-200 transition flex flex-col items-center">
            <div class="text-5xl mb-3">❌</div>
            <p class="font-bold text-red-700">Belum Diberi Makan</p>
          </div>
          <div onclick="beriMakan()"
               class="cursor-pointer p-6 rounded-xl border-2 bg-green-100 border-green-500 hover:bg-green-200 transition flex flex-col items-center">
            <div class="text-5xl mb-3">✅</div>
            <p class="font-bold text-green-700">Sudah Diberi Makan</p>
          </div>
        </div>
      </div>
    `;
  }

  // STEP 3
  else if(currentStep === 3){
    stepContent.innerHTML = `
      <div class="bg-white p-6 rounded-2xl shadow-md relative overflow-x-auto">
        <button onclick="goBackKambing()" class="absolute top-3 right-3 bg-gray-600 text-white px-4 py-2 rounded-lg">Kembali ke Pilih Kambing</button>
        <h2 class="text-lg font-semibold mb-4">Laporan Pangan Kambing</h2>
        <div class="mb-4 text-left">
          <label class="font-medium">Lihat history tanggal:</label>
          <input type="date" id="historyDate" value="${currentDateKey}" class="ml-2 border p-1 rounded"
                 onchange="loadHistory(this.value)">
        </div>
        <table class="w-full border text-center mb-4">
          <thead class="bg-gray-200">
            <tr>
              <th class="border p-2">No</th>
              <th class="border p-2">Waktu</th>
              <th class="border p-2">Nama Kambing</th>
              <th class="border p-2">Status</th>
              <th class="border p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${laporanData.length > 0 ? laporanData.map((d,i)=>`
              <tr>
                <td class="border p-2">${i+1}</td>
                <td class="border p-2">${d.timestamp || "-"}</td>
                <td class="border p-2">${d.nama}</td>
                <td class="border p-2 text-green-600 font-semibold">Sudah Diberi Makan</td>
                <td class="border p-2">
                  <button onclick="openHapusLaporanModal(${i})" class="bg-red-600 text-white px-2 py-1 rounded">Hapus</button>
                </td>
              </tr>
            `).join("") : `<tr><td colspan="5" class="p-4 text-gray-500">Belum ada data</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  }

  // STEP 4
  else if(currentStep === 4){
    const counts = kambings.map(k=>({ nama:k, jumlah: laporanData.filter(d=>d.nama===k).length }));
    stepContent.innerHTML = `
      <div class="bg-white p-6 rounded-2xl shadow-md relative">
        <button onclick="goBackKambing()" class="absolute top-3 right-3 bg-gray-600 text-white px-4 py-2 rounded-lg">Kembali ke Pilih Kambing</button>
        <h2 class="text-lg font-semibold mb-4">Laporan Semua Kambing</h2>
        <div class="mb-4 text-left">
          <label class="font-medium">Lihat history tanggal:</label>
          <input type="date" id="historyDateAll" value="${currentDateKey}" class="ml-2 border p-1 rounded"
                 onchange="loadHistory(this.value,true)">
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${counts.map(c=>{
            let warna = "bg-red-100 border-red-400 text-red-700"; 
            if(c.jumlah===1) warna = "bg-yellow-100 border-yellow-400 text-yellow-700"; 
            if(c.jumlah>=2) warna = "bg-green-100 border-green-400 text-green-700";
            return `
              <div class="p-4 border-2 ${warna} rounded-lg shadow">
                <h3 class="font-bold mb-2">🐐 ${c.nama}</h3>
                <p class="mb-2">${c.jumlah>0 
                  ? `Sudah diberi makan <b>${c.jumlah} kali</b> hari ini` 
                  : `<span class="text-red-600">Belum diberi makan hari ini</span>`}
                </p>
                <button onclick="showDetail('${c.nama}')" class="bg-blue-600 text-white px-4 py-2 rounded">Detail</button>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }
}

// STEP FUNCTION 
function selectKambing(nama){ selectedKambing = nama; renderStep(); }
function goNext(){ if(currentStep===1 && !selectedKambing) return; currentStep++; renderStep(); }
function goBackKambing(){ currentStep = 1; renderStep(); }
function beriMakan(){
  const now=new Date();
  const hari = now.toLocaleDateString("id-ID",{ weekday:"long" });
  const jam = now.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"});
  const timestamp = `${hari}, ${jam}`;
  laporanData.unshift({nama:selectedKambing, timestamp});
  saveLaporanHari(laporanData,currentDateKey);
  currentStep=3; renderStep();
}
function loadHistory(dateKey,isAll=false){
  currentDateKey=dateKey;
  laporanData=getLaporanHari(dateKey);
  if(isAll) currentStep=4;
  renderStep();
}
function goToLaporanSemua(){
  const btn = document.getElementById("btnLaporanPangan");
  if(currentStep === 4){
    currentStep = 1; 
    btn.innerHTML = "📊 Cek Laporan Semua Kambing";
  } else {
    currentStep = 4; 
    btn.innerHTML = "🔙 Kembali";
  }
  renderStep();
}


// MODAL DETAIL LAPORAN 
function showDetail(nama){
  const detail = laporanData.filter(d=>d.nama===nama);
  const list = detail.map((d,i)=>`
    <tr>
      <td class="border p-2">${i+1}</td>
      <td class="border p-2">${d.timestamp}</td>
      <td class="border p-2">Sudah Diberi Makan</td>
    </tr>
  `).join("");
  document.body.insertAdjacentHTML("beforeend", `
    <div id="modalDetail" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 class="text-lg font-semibold mb-4">Detail ${nama}</h2>
        <table class="w-full border text-center mb-4">
          <thead class="bg-gray-200">
            <tr>
              <th class="border p-2">No</th>
              <th class="border p-2">Waktu</th>
              <th class="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            ${list || `<tr><td colspan="3" class="p-4 text-gray-500">Belum ada data</td></tr>`}
          </tbody>
        </table>
        <button onclick="closeDetail()" class="bg-gray-600 text-white px-4 py-2 rounded w-full">Tutup</button>
      </div>
    </div>
  `);
}
function closeDetail(){ document.getElementById("modalDetail").remove(); }

// MODAL PIN
function openPinModal(target){
  currentPinTarget=target;
  document.getElementById("pinError").classList.add("hidden");
  openModal("modalPin"); 
}
function resetPinModal(){
  document.getElementById("pinInput").value = "";
  document.getElementById("pinError").classList.add("hidden");
  closeModal('modalPin'); // cukup close aja
}

function checkPin(){
  const pin=document.getElementById("pinInput").value;
  if(pin==="0000"){
    document.getElementById("pinError").classList.add("hidden");
    if(currentPinTarget==="kambing") openKambingModal();
    if(currentPinTarget==="hapusLaporan") doHapusLaporan();
  }else{
    document.getElementById("pinError").classList.remove("hidden");
  }
}

// MODAL KAMBING CRUD 
function openKambingModal(){ openModal("modalKambing"); renderKelolaKambing(); }
function closeKambingModal(){ closeModal("modalKambing"); }
function renderKelolaKambing(){
  const list=document.getElementById("kambingList");
  list.innerHTML=kambings.map((nama,i)=>`
    <div class="flex justify-between items-center border p-2 rounded-lg">
      <span>${nama}</span>
      <div class="space-x-2">
        <button onclick="openEditKambing(${i})" class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
        <button onclick="openHapusKambing(${i})" class="bg-red-500 text-white px-2 py-1 rounded">Hapus</button>
      </div>
    </div>
  `).join("");
}
function addKambing(){
  const val=document.getElementById("newKambing").value.trim();
  if(val){ kambings.push(val); saveKambings(); renderKelolaKambing(); renderStep(); }
  document.getElementById("newKambing").value="";
}
function openEditKambing(index){ editKambingIndex=index; document.getElementById("editKambingInput").value=kambings[index]; openModal("modalEditKambing"); }
function closeEditKambing(){ closeModal("modalEditKambing"); }
function confirmEditKambing(){ const newName=document.getElementById("editKambingInput").value.trim(); if(newName){ kambings[editKambingIndex]=newName; saveKambings(); renderStep(); renderKelolaKambing(); } closeEditKambing(); }
function openHapusKambing(index){ hapusKambingIndex=index; document.getElementById("hapusKambingText").innerText=`Apakah yakin ingin menghapus "${kambings[index]}"?`; openModal("modalHapusKambing"); }
function closeHapusKambing(){ closeModal("modalHapusKambing"); }
function confirmHapusKambing(){ if(hapusKambingIndex!==null){ kambings.splice(hapusKambingIndex,1); saveKambings(); renderStep(); renderKelolaKambing(); } closeHapusKambing(); }

// MODAL HAPUS LAPORAN
function openHapusLaporanModal(index){
  hapusLaporanIndex = index;
  document.getElementById("hapusLaporanError").classList.add("hidden");
  openModal("modalHapusLaporan"); 
}
function resetHapusLaporanModal(){ 
  const el = document.getElementById("hapusLaporanPin");
  el.value="";
  document.getElementById("hapusLaporanError").classList.add("hidden");
  closeModal("modalHapusLaporan");
}
function confirmHapusLaporan(){
  const pin=document.getElementById("hapusLaporanPin").value;
  if(pin==="0000" && hapusLaporanIndex!==null){
    laporanData.splice(hapusLaporanIndex,1);
    saveLaporanHari(laporanData,currentDateKey);
    renderStep();
    resetHapusLaporanModal();
  } else {
    document.getElementById("hapusLaporanError").classList.remove("hidden");
  }
}
// PIN 
function doHapusLaporan(){
  if(hapusLaporanIndex!==null){
    laporanData.splice(hapusLaporanIndex,1);
    saveLaporanHari(laporanData,currentDateKey);
    renderStep();
    hapusLaporanIndex=null;
  }
}

renderStep();

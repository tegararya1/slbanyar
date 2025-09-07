
const stepContent = document.getElementById("stepContent");
const stepIndicator = document.getElementById("stepIndicator");

// STATE 
let currentStep = 1;
let selectedProfil = null;
let selectedDrum = null;
let inputTHG = {};
let warna = null;
let currentDateKey = todayKey();
let editIndex = null;
let hapusIndex = null;
let editDrumIndex = null;
let hapusDrumIndex = null;
let hapusLaporanIndex = null;
let currentPinTarget = null;

// DATA PROFIL & DRUM 
let profiles = JSON.parse(localStorage.getItem("profiles")) || ["Ahmad","Siti","Budi","Rina","Dimas"];
let drums = JSON.parse(localStorage.getItem("drums")) || ["A","B","C","D"];
function saveProfiles(){ localStorage.setItem("profiles", JSON.stringify(profiles)); }
function saveDrums(){ localStorage.setItem("drums", JSON.stringify(drums)); }

// LOCAL STORAGE LAPORAN 
function todayKey(){ return new Date().toISOString().split("T")[0]; }
function getLaporanHari(key = todayKey()){ return JSON.parse(localStorage.getItem("laporan_" + key)) || []; }
function saveLaporanHari(data, key = todayKey()){ localStorage.setItem("laporan_" + key, JSON.stringify(data)); }
let laporanData = getLaporanHari(currentDateKey);

// === HELPERS MODAL ===
function openModal(id){ document.getElementById(id).classList.remove("hidden"); }
function closeModal(id){ document.getElementById(id).classList.add("hidden"); }

// === STEP INDICATOR ===
function renderStepIndicator(){
  const steps = ["Profil","Drum","Input THG","Pilih Warna","Laporan"];
  stepIndicator.innerHTML = steps.map((s,i)=>`
    <div class="step ${currentStep===i+1?'active':''}">${i+1}. ${s}</div>
  `).join("");
}

// RENDER STEP 
function renderStep(){
  renderStepIndicator();

  // STEP 1: PROFIL
 if(currentStep === 1){
  stepContent.innerHTML = `
    <div class="bg-white p-6 rounded-2xl shadow-md text-center">
      <div class="flex justify-between mb-4">
        <button onclick="openPinModal('profil')" class="bg-gray-800 text-white px-4 py-2 rounded-lg">Kelola Profil</button>
        <button onclick="goNext()" class="bg-blue-600 text-white px-6 py-2 rounded-lg">Lanjut ke Drum</button>
      </div>
      <h2 class="text-lg font-semibold mb-4">Pilih Profil Siswa</h2>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        ${profiles.map(nama=>{
          const selected = selectedProfil?.nama === nama ? "bg-blue-200 border-2 border-blue-500" : "bg-blue-50";
          return `
            <div onclick="selectProfil('${nama}')"
                 class="cursor-pointer p-4 rounded-xl shadow-md ${selected} hover:bg-blue-100 transition">
              <div class="text-5xl mb-2">🎓</div>
              <p class="font-bold">${nama}</p>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}


  // STEP 2: DRUM
else if(currentStep === 2){
  stepContent.innerHTML = `
    <div class="bg-white p-6 rounded-2xl shadow-md text-center">
      <div class="flex justify-between mb-4">
        <button onclick="goBackProfil()" class="bg-gray-500 text-white px-6 py-2 rounded-lg">Kembali</button>
        <button onclick="openPinModal('drum')" class="bg-gray-800 text-white px-4 py-2 rounded-lg">Kelola Drum</button>
        <button onclick="goNext()" class="bg-blue-600 text-white px-6 py-2 rounded-lg">Lanjut ke Input THG</button>
      </div>
      <h2 class="text-lg font-semibold mb-4">Pilih Drum Fermentasi</h2>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        ${drums.map(nama=>{
          const selected = selectedDrum === nama ? "bg-green-200 border-2 border-green-500" : "bg-green-50";
          return `
            <div onclick="selectDrum('${nama}')"
                 class="cursor-pointer p-4 rounded-xl shadow-md ${selected} hover:bg-green-100 transition">
              <div class="text-5xl mb-2">🛢️</div>
              <p class="font-bold">Drum ${nama}</p>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}


  // STEP 3: INPUT THG
else if(currentStep === 3){
  stepContent.innerHTML = `
    <div class="bg-white p-6 rounded-2xl shadow-md text-center relative">
      <div class="flex justify-between mb-4">
        <button onclick="goBackDrum()" class="bg-gray-500 text-white px-6 py-2 rounded-lg">Kembali</button>
        <button onclick="skipTHG()" class="bg-yellow-500 text-white px-4 py-2 rounded">Lewati</button>
        <button onclick="nextStepTHG()" class="bg-blue-600 text-white px-6 py-2 rounded-lg">Lanjut</button>
      </div>
      <h2 class="text-lg font-semibold mb-4">Input Data THG</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input id="suhu" type="number" placeholder="Suhu (°C)" class="p-2 border rounded-lg">
        <input id="kelembapan" type="number" placeholder="Kelembapan (%)" class="p-2 border rounded-lg">
        <input id="gas" type="number" placeholder="Gas (ppm)" class="p-2 border rounded-lg">
      </div>
    </div>
  `;
}


  // STEP 4: PILIH WARNA
else if(currentStep === 4){
  stepContent.innerHTML = `
    <div class="bg-white p-6 rounded-2xl shadow-md text-center">
      <div class="flex justify-between mb-4">
        <button onclick="goBackTHG()" class="bg-gray-500 text-white px-6 py-2 rounded-lg">Kembali</button>
        <button onclick="generateLaporan()" class="bg-blue-600 text-white px-6 py-2 rounded-lg">Generate Laporan</button>
      </div>
      <h2 class="text-lg font-semibold mb-4">Pilih Status LED</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        ${["Belum Siap","Hampir Siap","Sudah Siap"].map(w=>{
          const warnaBg = w==="Belum Siap" ? "bg-red-100 hover:bg-red-200"
                        : w==="Hampir Siap" ? "bg-yellow-100 hover:bg-yellow-200"
                        : "bg-green-100 hover:bg-green-200";
          const bulatan = w==="Belum Siap" ? "bg-red-500"
                        : w==="Hampir Siap" ? "bg-yellow-500"
                        : "bg-green-500";
          return `
            <div onclick="setWarna('${w}')"
                 class="cursor-pointer p-6 rounded-xl border ${warna===w?'ring-2 ring-blue-500':''} ${warnaBg}">
              <div class="w-12 h-12 mx-auto rounded-full ${bulatan} mb-2"></div>
              <p class="font-semibold">${w}</p>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

  // STEP 5: LAPORAN
  else if(currentStep === 5){
    stepContent.innerHTML = `
      <div class="bg-white p-6 rounded-2xl shadow-md relative overflow-x-auto">
        <button onclick="goBackProfil()" class="absolute top-3 right-3 bg-gray-600 text-white px-4 py-2 rounded-lg">Kembali ke Profil</button>
        <h2 class="text-lg font-semibold mb-4">Laporan Monitoring</h2>
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
              <th class="border p-2">Nama</th>
              <th class="border p-2">Drum</th>
              <th class="border p-2">Suhu</th>
              <th class="border p-2">Kelembapan</th>
              <th class="border p-2">Gas</th>
              <th class="border p-2">Status</th>
              <th class="border p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${laporanData.length > 0 ? laporanData.map((d,i)=>{
              const warnaClass = d.warna==="Belum Siap" ? "text-red-600 font-bold"
                               : d.warna==="Hampir Siap" ? "text-yellow-600 font-bold"
                               : "text-green-600 font-bold";
              return `
                <tr>
                  <td class="border p-2">${i+1}</td>
                  <td class="border p-2">${d.timestamp || "-"}</td>
                  <td class="border p-2">${d.nama}</td>
                  <td class="border p-2">${d.drum || "-"}</td>
                  <td class="border p-2">${d.suhu || "-"}</td>
                  <td class="border p-2">${d.kelembapan || "-"}</td>
                  <td class="border p-2">${d.gas || "-"}</td>
                  <td class="border p-2 ${warnaClass}">${d.warna}</td>
                  <td class="border p-2">
                    <button onclick="openHapusLaporanModal(${i})" class="bg-red-600 text-white px-2 py-1 rounded">Hapus</button>
                  </td>
                </tr>
              `;
            }).join("") : `<tr><td colspan="9" class="p-4 text-gray-500">Belum ada data</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  }
}

// STEP CONTROL 
function selectProfil(nama){ selectedProfil = {nama}; renderStep(); }
function selectDrum(nama){ selectedDrum = nama; renderStep(); }
function goNext(){
  if(currentStep===1 && !selectedProfil) return;
  if(currentStep===2 && !selectedDrum) return;
  currentStep++; renderStep();
}
function goBackProfil(){ currentStep = 1; renderStep(); }
function goBackDrum(){ currentStep = 2; renderStep(); }
function goBackTHG(){ currentStep = 3; renderStep(); }

function nextStepTHG(){
  const suhu=document.getElementById("suhu").value;
  const kelembapan=document.getElementById("kelembapan").value;
  const gas=document.getElementById("gas").value;
  if(!suhu || !kelembapan || !gas){ openModal('modalWarning'); return; }
  inputTHG={suhu:suhu+"°C", kelembapan:kelembapan+"%", gas:gas+" ppm"};
  currentStep=4; renderStep();
}
function skipTHG(){ inputTHG={suhu:"-", kelembapan:"-", gas:"-"}; currentStep=4; renderStep(); }
function setWarna(w){ warna=w; renderStep(); }
function generateLaporan(){
  if(!warna) return;
  const now=new Date();
  const hari = now.toLocaleDateString("id-ID",{ weekday:"long" });
  const jam = now.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"});
  const timestamp = `${hari}, ${jam}`;
  laporanData.unshift({...selectedProfil, drum:selectedDrum, ...inputTHG, warna, timestamp});
  saveLaporanHari(laporanData,currentDateKey);
  currentStep=5; renderStep();
}
function loadHistory(dateKey){ currentDateKey=dateKey; laporanData=getLaporanHari(dateKey); renderStep(); }
function goToLaporan(){
  const btn = document.getElementById("btnLaporan");
  if(currentStep === 5){
    currentStep = 1; // balik ke awal
    btn.innerHTML = "📊 Cek Laporan"; 
  } else {
    currentStep = 5; // ke laporan
    btn.innerHTML = "🔙 Kembali"; 
  }
  renderStep();
}


// MODAL PIN
function openPinModal(target){
  currentPinTarget=target;
  document.getElementById("pinError").classList.add("hidden");
  openModal('modalPin');   
}
function resetPinModal(){
  document.getElementById("pinInput").value = "";
  document.getElementById("pinError").classList.add("hidden");
  currentPinTarget = null;   // reset target biar gak otomatis buka modal lain
  closeModal('modalPin');    // tutup modal
}


function checkPin(){
  const pin=document.getElementById("pinInput").value;
  if(pin==="0000"){
    // jangan pakai resetPinModal() disini biar target tetap jalan
    closeModal('modalPin');
    document.getElementById("pinInput").value="";
    document.getElementById("pinError").classList.add("hidden");

    if(currentPinTarget==="profil") openProfilModal();
    if(currentPinTarget==="drum") openDrumModal();
    if(currentPinTarget==="laporan") confirmHapusLaporan(true);

    currentPinTarget = null; // setelah berhasil, reset target
  }else{
    document.getElementById("pinError").classList.remove("hidden");
    document.getElementById("pinInput").value="";
  }
}

// MODAL PROFIL 
function openProfilModal(){ openModal('modalProfil'); renderKelolaProfil(); }
function closeProfilModal(){ closeModal('modalProfil'); }
function renderKelolaProfil(){
  const list=document.getElementById("profilList");
  list.innerHTML=profiles.map((nama,i)=>`
    <div class="flex justify-between items-center border p-2 rounded-lg">
      <span>${nama}</span>
      <div class="space-x-2">
        <button onclick="openEditModal(${i})" class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
        <button onclick="openHapusModal(${i})" class="bg-red-500 text-white px-2 py-1 rounded">Hapus</button>
      </div>
    </div>
  `).join("");
}
function addProfil(){
  const val=document.getElementById("newProfil").value.trim();
  if(val){ profiles.push(val); saveProfiles(); renderKelolaProfil(); renderStep(); }
  document.getElementById("newProfil").value="";
}
function openEditModal(index){ editIndex=index; document.getElementById("editProfilInput").value=profiles[index]; openModal('modalEditProfil'); }
function closeEditModal(){ closeModal('modalEditProfil'); }
function confirmEditProfil(){ 
  const newName=document.getElementById("editProfilInput").value.trim(); 
  if(newName){ 
    const old=profiles[editIndex];
    profiles[editIndex]=newName; 
    saveProfiles(); 
    if(selectedProfil && selectedProfil.nama===old){ selectedProfil={nama:newName}; }
    renderStep(); 
    renderKelolaProfil(); 
  } 
  closeEditModal(); 
}
function openHapusModal(index){ 
  hapusIndex=index; 
  document.getElementById("hapusText").innerText=`Apakah yakin ingin menghapus profil "${profiles[index]}"?`; 
  openModal('modalHapusProfil'); 
}
function closeHapusModal(){ closeModal('modalHapusProfil'); }
function confirmHapusProfil(){ 
  if(hapusIndex!==null){ 
    const removed=profiles.splice(hapusIndex,1)[0]; 
    if(selectedProfil && selectedProfil.nama===removed){ selectedProfil=null; currentStep=1; }
    saveProfiles(); 
    renderStep(); 
    renderKelolaProfil(); 
  } 
  closeHapusModal(); 
}

// MODAL DRUM 
function openDrumModal(){ openModal('modalDrum'); renderKelolaDrum(); }
function closeDrumModal(){ closeModal('modalDrum'); }
function renderKelolaDrum(){
  const list=document.getElementById("drumList");
  list.innerHTML=drums.map((nama,i)=>`
    <div class="flex justify-between items-center border p-2 rounded-lg">
      <span>Drum ${nama}</span>
      <div class="space-x-2">
        <button onclick="openEditDrum(${i})" class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
        <button onclick="openHapusDrum(${i})" class="bg-red-500 text-white px-2 py-1 rounded">Hapus</button>
      </div>
    </div>
  `).join("");
}
function addDrum(){
  const val=document.getElementById("newDrum").value.trim();
  if(val){ drums.push(val); saveDrums(); renderKelolaDrum(); renderStep(); }
  document.getElementById("newDrum").value="";
}
function openEditDrum(index){ editDrumIndex=index; document.getElementById("editDrumInput").value=drums[index]; openModal('modalEditDrum'); }
function closeEditDrum(){ closeModal('modalEditDrum'); }
function confirmEditDrum(){ 
  const newName=document.getElementById("editDrumInput").value.trim(); 
  if(newName){ 
    const old=drums[editDrumIndex];
    drums[editDrumIndex]=newName; 
    saveDrums(); 
    if(selectedDrum===old){ selectedDrum=newName; }
    renderStep(); 
    renderKelolaDrum(); 
  } 
  closeEditDrum(); 
}
function openHapusDrum(index){ hapusDrumIndex=index; document.getElementById("hapusDrumText").innerText=`Apakah yakin ingin menghapus drum "${drums[index]}"?`; openModal('modalHapusDrum'); }
function closeHapusDrum(){ closeModal('modalHapusDrum'); }
function confirmHapusDrum(){ 
  if(hapusDrumIndex!==null){ 
    const removed=drums.splice(hapusDrumIndex,1)[0]; 
    if(selectedDrum===removed){ selectedDrum=null; currentStep=2; }
    saveDrums(); 
    renderStep(); 
    renderKelolaDrum(); 
  } 
  closeHapusDrum(); 
}

// MODAL HAPUS LAPORAN
function openHapusLaporanModal(index){
  hapusLaporanIndex = index;
  document.getElementById("hapusLaporanError").classList.add("hidden");
  openModal('modalHapusLaporan'); 
}
function resetHapusLaporanModal(){ 
  const el = document.getElementById("hapusLaporanPin");
  el.value="";
  document.getElementById("hapusLaporanError").classList.add("hidden");
  closeModal('modalHapusLaporan');
}
function confirmHapusLaporan(force=false){
  const pin = document.getElementById("hapusLaporanPin").value;
  if(force || pin==="0000"){
    if(hapusLaporanIndex!==null){
      laporanData.splice(hapusLaporanIndex,1);
      saveLaporanHari(laporanData,currentDateKey);
      renderStep();
    }
    resetHapusLaporanModal();
  }else{
    document.getElementById("hapusLaporanError").classList.remove("hidden");
  }
}

// MODAL WARNING 
function closeWarningModal(){ closeModal('modalWarning'); }

// INIT 
renderStep();

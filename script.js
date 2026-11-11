const containerPortofolio = document.querySelector("#container-portofolio");
const loadingIndicator = document.querySelector("#loading");
const btnInfo = document.querySelector("#btn-info");
const kotakAside = document.querySelector("aside");
const formKomentar = document.querySelector("#form-komentar");
const daftarKomentar = document.querySelector("#daftar-komentar");
const pesanError = document.querySelector("#pesan-error");
const btnHapusSemua = document.querySelector("#btn-hapus-semua");
const inputNama = document.querySelector("#input-nama");
const inputPesan = document.querySelector("#input-pesan");
const formPortofolio = document.querySelector("#form-portofolio");
const btnReset = document.querySelector("#btn-reset");

function pesanDariStatus(status) {
    if (status === 404) return "Data tidak ditemukan di server.";
    if (status === 400) return "Data yang dikirim tidak valid.";
    if (status >= 500) return "Server sedang bermasalah, coba lagi nanti.";
    return "Terjadi kesalahan tidak terduga (Status: " + status + ").";
}

function muatStatusAside() {
    const statusAside = localStorage.getItem("statusAside");
    if (statusAside === "tersembunyi" && kotakAside) {
        kotakAside.classList.add("tersembunyi");
    }
}

if (btnInfo && kotakAside) {
    btnInfo.addEventListener("click", () => {
        kotakAside.classList.toggle("tersembunyi");
        const isHidden = kotakAside.classList.contains("tersembunyi");
        localStorage.setItem("statusAside", isHidden ? "tersembunyi" : "tampil");
    });
}

function renderItemPortofolio(item) {
    const kartu = document.createElement("kartu-artikel");
    if (item.id) kartu.setAttribute("data-id", item.id);
    kartu.setAttribute("judul", item.judul);
    kartu.setAttribute("waktu", item.waktu);
    kartu.setAttribute("isi", item.deskripsi);
    
    containerPortofolio.appendChild(kartu);
}

async function muatPortofolioDariAPI() {
    if (!containerPortofolio) return;
    if (loadingIndicator) loadingIndicator.classList.remove("tersembunyi");

    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=4");
        if (!response.ok) throw new Error(pesanDariStatus(response.status));

        const dataPosts = await response.json();
        containerPortofolio.innerHTML = "";

        dataPosts.forEach((post) => {
            renderItemPortofolio({
                id: post.id,
                judul: post.title,
                waktu: `Proyek #${post.id}`,
                deskripsi: post.body
            });
        });

    } catch (error) {
        containerPortofolio.innerHTML = `<p class='error-msg'>${error.message}</p>`;
        console.error("Gagal mengambil data portofolio:", error);
    } finally {
        if (loadingIndicator) loadingIndicator.classList.add("tersembunyi");
    }
}

if (formPortofolio) {
    formPortofolio.addEventListener("submit", (e) => {
        e.preventDefault();

        const judul = document.querySelector("#input-judul-porto").value.trim();
        const waktu = document.querySelector("#input-waktu-porto").value.trim();
        const deskripsi = document.querySelector("#input-deskripsi-porto").value.trim();

        if (judul && waktu && deskripsi) {
            renderItemPortofolio({ judul, waktu, deskripsi });
            formPortofolio.reset();
        }
    });
}

async function muatProfilPenulis() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
        if (!response.ok) throw new Error(pesanDariStatus(response.status));
        
        const user = await response.json();
        const namaPenulis = document.querySelector("#nama-penulis");
        const emailPenulis = document.querySelector("#email-penulis");

        if (namaPenulis) namaPenulis.textContent = user.name;
        if (emailPenulis) {
            emailPenulis.textContent = user.email;
            emailPenulis.href = `mailto:${user.email}`;
        }
    } catch (error) {
        console.error("Gagal memuat profil penulis:", error.message);
    }
}

async function kirimKomentarKeServer(nama, pesan) {
    const response = await fetch("https://jsonplaceholder.typicode.com/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nama, body: pesan, postId: 1 }),
    });

    if (!response.ok) throw new Error(pesanDariStatus(response.status));
    return await response.json();
}

function renderKomentarKeDOM(id, nama, pesan) {
    const kartuKomentar = document.createElement("kartu-komentar");
    if (id) kartuKomentar.setAttribute("data-id", id);
    kartuKomentar.setAttribute("nama", nama);
    kartuKomentar.setAttribute("pesan", pesan);

    daftarKomentar.appendChild(kartuKomentar);
}

async function muatKomentarAwal() {
    if (!daftarKomentar) return;
    daftarKomentar.innerHTML = "";

    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts/1/comments?_limit=3");
        if (!response.ok) throw new Error(pesanDariStatus(response.status));
        
        const comments = await response.json();
        comments.forEach((c) => {
            renderKomentarKeDOM(c.id, c.name || c.email.split('@')[0], c.body);
        });
    } catch (error) {
        console.error("Gagal memuat komentar awal:", error.message);
    }
}

if (formKomentar) {
    formKomentar.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nama = inputNama.value.trim();
        const pesan = inputPesan.value.trim();

        if (nama === "" || pesan.length < 5) {
            if (pesanError) {
                pesanError.textContent = "Nama wajib diisi dan komentar minimal 5 karakter!";
                pesanError.classList.remove("tersembunyi");
            }
            return;
        }

        if (pesanError) pesanError.classList.add("tersembunyi");

        const btnSubmit = formKomentar.querySelector("button[type='submit']");
        try {
            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.textContent = "Mengirim...";
            }

            const hasil = await kirimKomentarKeServer(nama, pesan);
            renderKomentarKeDOM(hasil.id, hasil.name, hasil.body);

            sessionStorage.removeItem("drafNama");
            sessionStorage.removeItem("drafPesan");
            formKomentar.reset();
        } catch (error) {
            alert("Gagal mengirim komentar: " + error.message);
            console.error(error);
        } finally {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = "Kirim Komentar";
            }
        }
    });
}

if (btnHapusSemua && daftarKomentar) {
    btnHapusSemua.addEventListener("click", () => {
        daftarKomentar.innerHTML = "";
    });
}

if (inputNama && inputPesan) {
    inputNama.value = sessionStorage.getItem("drafNama") || "";
    inputPesan.value = sessionStorage.getItem("drafPesan") || "";

    inputNama.addEventListener("input", () => {
        sessionStorage.setItem("drafNama", inputNama.value);
    });

    inputPesan.addEventListener("input", () => {
        sessionStorage.setItem("drafPesan", inputPesan.value);
    });
}

if (btnReset) {
    btnReset.addEventListener("click", () => {
        const konfirmasi = confirm("Hapus semua preferensi tersimpan?");
        if (konfirmasi) {
            localStorage.clear();
            sessionStorage.clear();
            location.reload();
        }
    });
}

muatStatusAside();
muatPortofolioDariAPI();
muatProfilPenulis();
muatKomentarAwal();
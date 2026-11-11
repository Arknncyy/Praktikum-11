class SalamPengguna extends HTMLElement {
    connectedCallback() {
        const nama = this.getAttribute("nama") || "Tamu";
        this.textContent = `Halo, ${nama}! Selamat datang di blog.`;
    }
}
customElements.define("salam-pengguna", SalamPengguna);


class KartuArtikel extends HTMLElement {
    #like = 0;

    static get observedAttributes() {
        return ["judul", "isi", "waktu", "data-id"];
    }

    connectedCallback() {
        const judul = this.getAttribute("judul") || "";
        const semuaLike = JSON.parse(localStorage.getItem("semuaLike")) || {};
        if (semuaLike[judul]) {
            this.#like = semuaLike[judul];
        }
        this.render();
    }

    disconnectedCallback() {
        console.log("kartu-artikel dilepas dari DOM");
    }

    attributeChangedCallback() {
        if (this.isConnected) {
            this.render();
        }
    }

    render() {
        this.innerHTML = `
            <article class="kartu">
                <h3></h3>
                <p class="waktu"><time></time></p>
                <p class="isi"></p>
                <button class="btn-like"></button>
                <button class="btn-hapus btn-danger">Hapus Item</button>
            </article>
        `;

        const elJudul = this.querySelector("h3");
        const elWaktu = this.querySelector(".waktu time");
        const elIsi = this.querySelector(".isi");
        const btnLike = this.querySelector(".btn-like");
        const btnHapus = this.querySelector(".btn-hapus");

        elJudul.textContent = this.getAttribute("judul") ?? "";
        elWaktu.textContent = this.getAttribute("waktu") ?? "";
        elIsi.textContent = this.getAttribute("isi") ?? "";

        btnLike.textContent = `Like (${this.#like})`;
        btnLike.addEventListener("click", async () => {
            this.#like++;
            btnLike.textContent = `Like (${this.#like})`;

            const judul = this.getAttribute("judul");
            const postId = this.getAttribute("data-id") || 1;

            const semuaLike = JSON.parse(localStorage.getItem("semuaLike")) || {};
            semuaLike[judul] = this.#like;
            localStorage.setItem("semuaLike", JSON.stringify(semuaLike));

            try {
                await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ likes: this.#like })
                });
                console.log(`Like untuk post #${postId} diperbarui ke server: ${this.#like}`);
            } catch (err) {
                console.error("Gagal sinkronisasi like ke server:", err);
            }
        });

        // Event Hapus
        btnHapus.addEventListener("click", () => this.remove());
    }
}
customElements.define("kartu-artikel", KartuArtikel);


class KartuKomentar extends HTMLElement {
    static get observedAttributes() {
        return ["nama", "pesan", "data-id"];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        if (this.isConnected) this.render();
    }

    render() {
        this.innerHTML = `
            <li style="margin-bottom: 8px;">
                <span class="teks-komentar"></span>
                <button class="btn-hapus-komentar btn-danger" style="margin-left: 10px;">Hapus</button>
            </li>
        `;

        const nama = this.getAttribute("nama") ?? "Anonim";
        const pesan = this.getAttribute("pesan") ?? "";
        const id = this.getAttribute("data-id");

        const teksElem = this.querySelector(".teks-komentar");
        teksElem.textContent = `${nama}: ${pesan}`;

        const btnHapus = this.querySelector(".btn-hapus-komentar");
        btnHapus.addEventListener("click", async () => {
            if (id) {
                try {
                    btnHapus.disabled = true;
                    btnHapus.textContent = "Menghapus...";

                    const res = await fetch(`https://jsonplaceholder.typicode.com/comments/${id}`, {
                        method: "DELETE"
                    });
                    if (!res.ok) throw new Error("Gagal menghapus di server");
                    console.log(`Komentar #${id} berhasil dihapus dari server.`);
                } catch (err) {
                    console.error(err);
                }
            }
            this.remove();
        });
    }
}
customElements.define("kartu-komentar", KartuKomentar);


class TombolTema extends HTMLElement {
    connectedCallback() {
        this.render();
        this.muatPreferensi();
        
        document.addEventListener("keydown", (e) => {
            const activeTag = document.activeElement.tagName;
            if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;
            if (e.key.toLowerCase() === "d") this.toggleTema();
        });
    }

    render() {
        this.innerHTML = `<button id="btn-tema-elem">Mode Gelap</button>`;
        const btn = this.querySelector("#btn-tema-elem");
        btn.addEventListener("click", () => this.toggleTema());
    }

    toggleTema() {
        document.body.classList.toggle("dark-mode");
        const isDark = document.body.classList.contains("dark-mode");
        const tema = isDark ? "dark" : "light";
        localStorage.setItem("tema", tema);
        
        const btn = this.querySelector("#btn-tema-elem");
        if (btn) btn.textContent = isDark ? "Mode Terang" : "Mode Gelap";
    }

    muatPreferensi() {
        const tema = localStorage.getItem("tema");
        const btn = this.querySelector("#btn-tema-elem");
        if (tema === "dark") {
            document.body.classList.add("dark-mode");
            if (btn) btn.textContent = "Mode Terang";
        } else {
            document.body.classList.remove("dark-mode");
            if (btn) btn.textContent = "Mode Gelap";
        }
    }
}
customElements.define("tombol-tema", TombolTema);
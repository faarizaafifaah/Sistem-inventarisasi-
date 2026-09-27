// ======================================================
// ASSETLY
// SISTEM INVENTARISASI & PELEPASAN ASET KANTOR
// ======================================================


// ======================================================
// 1. SUPABASE
// ======================================================
//
// ISI DENGAN DATA PROJECT SUPABASE KAMU
//

const SUPABASE_URL = "https://nsoabjnxrnjientofczl.supabase.co";

const SUPABASE_KEY = "sb_publishable_NdvizmBtDqoYrW7C0nzFIA_D3M4gWtI";


if (
    SUPABASE_URL === "https://nsoabjnxrnjientofczl.supabase.co" ||
    SUPABASE_KEY === "sb_publishable_NdvizmBtDqoYrW7C0nzFIA_D3M4gWtI"
) {

    console.error(
        "Supabase belum dikonfigurasi. Isi SUPABASE_URL dan SUPABASE_KEY di script.js"
    );

}


const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ======================================================
// 2. VARIABEL DATA
// ======================================================

let semuaAset = [];
let semuaKategori = [];
let semuaPelepasan = [];


// ======================================================
// 3. FORMAT RUPIAH
// ======================================================

function rupiah(angka) {

    const nilai = Number(angka) || 0;

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(nilai);
}


// ======================================================
// 4. FORMAT TANGGAL
// ======================================================

function formatTanggal(tanggal) {

    if (!tanggal) {
        return "-";
    }

    const date = new Date(tanggal + "T00:00:00");

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


// ======================================================
// 5. DASHBOARD DATE
// ======================================================

function tampilkanTanggal() {

    const element = document.getElementById("today");

    if (!element) {
        return;
    }

    const sekarang = new Date();

    element.textContent = sekarang.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );
}


// ======================================================
// 6. NAVIGASI
// ======================================================

function showPage(pageId, button) {

    document.querySelectorAll(".page").forEach(page => {

        page.classList.remove("active-page");

    });


    const page = document.getElementById(pageId);

    if (page) {
        page.classList.add("active-page");
    }


    document.querySelectorAll(".menu").forEach(menu => {

        menu.classList.remove("active");

    });


    if (button) {
        button.classList.add("active");
    }


    if (pageId === "dashboard") {
        loadDashboard();
    }

    if (pageId === "aset") {
        renderAset();
    }

    if (pageId === "kategori") {
        renderKategori();
    }

    if (pageId === "pelepasan") {
        renderPelepasan();
    }
}


function showPageById(pageId) {

    const buttons = document.querySelectorAll(".menu");

    buttons.forEach(button => {

        if (
            button.getAttribute("onclick") &&
            button.getAttribute("onclick").includes(
                "'" + pageId + "'"
            )
        ) {

            showPage(pageId, button);

        }

    });

}


// ======================================================
// 7. KATEGORI
// ======================================================

async function loadKategori() {

    try {

        const { data, error } = await db
            .from("kategori")
            .select("*")
            .order("id_kategori", {
                ascending: true
            });


        if (error) {

            console.error("ERROR LOAD KATEGORI:", error);

            throw error;

        }


        semuaKategori = data || [];


        renderKategori();

        isiSelectKategori();

    }

    catch (error) {

        console.error(error);

        const container =
            document.getElementById("kategoriContainer");

        if (container) {

            container.innerHTML = `
                <div class="empty-card">
                    Gagal mengambil data kategori.<br>
                    <small>${error.message}</small>
                </div>
            `;

        }

    }

}


// ======================================================
// RENDER KATEGORI
// ======================================================

function renderKategori() {

    const container =
        document.getElementById("kategoriContainer");

    if (!container) {
        return;
    }


    if (semuaKategori.length === 0) {

        container.innerHTML = `
            <div class="empty-card">
                Belum ada kategori 🌷<br>
                <small>Silakan tambahkan kategori baru.</small>
            </div>
        `;

        return;
    }


    const emoji = [
        "💻",
        "🖨️",
        "🪑",
        "🚗",
        "📁",
        "📱",
        "🖥️",
        "📦"
    ];


    container.innerHTML = semuaKategori.map(
        (kategori, index) => {

            return `
                <div class="category-card">

                    <div class="category-actions">

                        <button
                            class="btn-action btn-edit"
                            onclick="editKategori(${kategori.id_kategori})"
                            title="Edit">
                            ✎
                        </button>

                        <button
                            class="btn-action btn-delete"
                            onclick="hapusKategori(${kategori.id_kategori})"
                            title="Hapus">
                            ×
                        </button>

                    </div>

                    <div class="category-emoji">
                        ${emoji[index % emoji.length]}
                    </div>

                    <h3>
                        ${escapeHTML(kategori.nama_kategori)}
                    </h3>

                    <p>
                        Kategori aset kantor
                    </p>

                </div>
            `;

        }
    ).join("");

}


// ======================================================
// SELECT KATEGORI
// ======================================================

function isiSelectKategori() {

    const select =
        document.getElementById("id_kategori");

    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            Pilih kategori
        </option>
    `;


    semuaKategori.forEach(kategori => {

        const option =
            document.createElement("option");

        option.value = kategori.id_kategori;

        option.textContent =
            kategori.nama_kategori;

        select.appendChild(option);

    });

}


// ======================================================
// MODAL KATEGORI
// ======================================================

function openKategoriModal() {

    document.getElementById("formKategori").reset();

    document.getElementById("editKategori").value = "";

    document.getElementById("judulModalKategori").textContent =
        "Tambah Kategori";


    document.getElementById("modalKategori")
        .classList.add("show");

}


function closeKategoriModal() {

    document.getElementById("modalKategori")
        .classList.remove("show");

}


// ======================================================
// SIMPAN KATEGORI
// ======================================================

document
    .getElementById("formKategori")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const namaInput =
            document.getElementById("nama_kategori");

        const id =
            document.getElementById("editKategori").value;


        const nama =
            namaInput.value.trim();


        if (!nama) {

            alert("Nama kategori wajib diisi.");

            namaInput.focus();

            return;

        }


        try {

            let error;


            if (id) {

                const result = await db
                    .from("kategori")
                    .update({
                        nama_kategori: nama
                    })
                    .eq(
                        "id_kategori",
                        Number(id)
                    );

                error = result.error;

            }

            else {

                const result = await db
                    .from("kategori")
                    .insert({
                        nama_kategori: nama
                    });

                error = result.error;

            }


            if (error) {

                console.error(
                    "SUPABASE ERROR KATEGORI:",
                    error
                );

                alert(
                    "Gagal menyimpan kategori:\n\n" +
                    error.message
                );

                return;

            }


            alert("Kategori berhasil disimpan! ✨");


            closeKategoriModal();

            await loadKategori();

            await loadAset();

            await loadDashboard();

        }

        catch (error) {

            console.error(
                "JAVASCRIPT ERROR KATEGORI:",
                error
            );

            alert(
                "Terjadi error:\n\n" +
                error.message
            );

        }

    });


// ======================================================
// EDIT KATEGORI
// ======================================================

function editKategori(id) {

    const kategori =
        semuaKategori.find(
            item =>
                Number(item.id_kategori) === Number(id)
        );


    if (!kategori) {
        return;
    }


    document.getElementById("editKategori").value =
        kategori.id_kategori;


    document.getElementById("nama_kategori").value =
        kategori.nama_kategori;


    document.getElementById("judulModalKategori").textContent =
        "Edit Kategori";


    document.getElementById("modalKategori")
        .classList.add("show");

}


// ======================================================
// HAPUS KATEGORI
// ======================================================

async function hapusKategori(id) {

    const kategori =
        semuaKategori.find(
            item =>
                Number(item.id_kategori) === Number(id)
        );


    if (!kategori) {
        return;
    }


    const yakin = confirm(
        `Hapus kategori "${kategori.nama_kategori}"?`
    );


    if (!yakin) {
        return;
    }


    try {

        const { error } = await db
            .from("kategori")
            .delete()
            .eq(
                "id_kategori",
                Number(id)
            );


        if (error) {

            console.error(error);

            alert(
                "Kategori tidak bisa dihapus.\n\n" +
                error.message
            );

            return;

        }


        alert("Kategori berhasil dihapus.");

        await loadKategori();

        await loadAset();

        await loadDashboard();

    }

    catch (error) {

        alert(
            "Terjadi error:\n\n" +
            error.message
        );

    }

}


// ======================================================
// 8. DATA ASET
// ======================================================

async function loadAset() {

    try {

        const { data, error } = await db
            .from("aset")
            .select(`
                *,
                kategori (
                    nama_kategori
                )
            `)
            .order("id_aset", {
                ascending: false
            });


        if (error) {

            console.error("ERROR LOAD ASET:", error);

            throw error;

        }


        semuaAset = data || [];


        renderAset();

        isiSelectPelepasan();

    }

    catch (error) {

        console.error(error);

        const table =
            document.getElementById("tabelAset");

        if (table) {

            table.innerHTML = `
                <tr>
                    <td colspan="9" class="empty">
                        Gagal mengambil data aset.<br>
                        <small>${error.message}</small>
                    </td>
                </tr>
            `;

        }

    }

}


// ======================================================
// RENDER ASET
// ======================================================

function renderAset(data = semuaAset) {

    const table =
        document.getElementById("tabelAset");

    if (!table) {
        return;
    }


    if (!data || data.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="9" class="empty">
                    Belum ada data aset 📦
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML = data.map(aset => {

        const namaKategori =
            aset.kategori
                ? aset.kategori.nama_kategori
                : "-";


        return `
            <tr>

                <td>
                    <strong>
                        ${escapeHTML(aset.kode_aset)}
                    </strong>
                </td>


                <td>
                    <div class="asset-name">
                        ${escapeHTML(aset.nama_aset)}
                    </div>

                    <div class="asset-code">
                        ID: ${aset.id_aset}
                    </div>
                </td>


                <td>
                    ${escapeHTML(namaKategori)}
                </td>


                <td>
                    ${escapeHTML(aset.lokasi)}
                </td>


                <td>
                    ${formatTanggal(
                        aset.tanggal_perolehan
                    )}
                </td>


                <td>
                    ${rupiah(aset.harga_perolehan)}
                </td>


                <td>
                    ${badgeKondisi(aset.kondisi)}
                </td>


                <td>
                    ${badgeStatus(aset.status_aset)}
                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            class="btn-action btn-edit"
                            onclick="editAset(${aset.id_aset})"
                            title="Edit">
                            ✎
                        </button>


                        <button
                            class="btn-action btn-delete"
                            onclick="hapusAset(${aset.id_aset})"
                            title="Hapus">
                            ×
                        </button>

                    </div>

                </td>

            </tr>
        `;

    }).join("");

}


// ======================================================
// BADGE KONDISI
// ======================================================

function badgeKondisi(kondisi) {

    if (kondisi === "Baik") {

        return `
            <span class="badge badge-green">
                Baik
            </span>
        `;

    }


    if (kondisi === "Rusak Ringan") {

        return `
            <span class="badge badge-orange">
                Rusak Ringan
            </span>
        `;

    }


    return `
        <span class="badge badge-red">
            ${escapeHTML(kondisi || "-")}
        </span>
    `;

}


// ======================================================
// BADGE STATUS
// ======================================================

function badgeStatus(status) {

    if (status === "Aktif") {

        return `
            <span class="badge badge-purple">
                Aktif
            </span>
        `;

    }


    if (status === "Tidak Aktif") {

        return `
            <span class="badge badge-orange">
                Tidak Aktif
            </span>
        `;

    }


    return `
        <span class="badge badge-red">
            ${escapeHTML(status || "-")}
        </span>
    `;

}


// ======================================================
// MODAL ASET
// ======================================================

function openAsetModal(id = null) {

    const form =
        document.getElementById("formAset");


    form.reset();


    document.getElementById("id_aset").value =
        "";


    document.getElementById("judulModalAset").textContent =
        "Tambah Aset";


    if (id) {

        const aset =
            semuaAset.find(
                item =>
                    Number(item.id_aset) === Number(id)
            );


        if (!aset) {
            return;
        }


        document.getElementById("judulModalAset").textContent =
            "Edit Aset";


        document.getElementById("id_aset").value =
            aset.id_aset;


        document.getElementById("kode_aset").value =
            aset.kode_aset;


        document.getElementById("nama_aset").value =
            aset.nama_aset;


        document.getElementById("id_kategori").value =
            aset.id_kategori;


        document.getElementById("lokasi").value =
            aset.lokasi;


        document.getElementById("tanggal_perolehan").value =
            aset.tanggal_perolehan;


        document.getElementById("harga_perolehan").value =
            aset.harga_perolehan;


        document.getElementById("kondisi").value =
            aset.kondisi;


        document.getElementById("status_aset").value =
            aset.status_aset;

    }


    document.getElementById("modalAset")
        .classList.add("show");

}


function closeAsetModal() {

    document.getElementById("modalAset")
        .classList.remove("show");

}


// ======================================================
// SIMPAN ASET
// ======================================================

document
    .getElementById("formAset")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const id =
            document.getElementById("id_aset").value;


        const data = {

            id_kategori:
                Number(
                    document.getElementById(
                        "id_kategori"
                    ).value
                ),

            kode_aset:
                document.getElementById(
                    "kode_aset"
                ).value.trim(),

            nama_aset:
                document.getElementById(
                    "nama_aset"
                ).value.trim(),

            lokasi:
                document.getElementById(
                    "lokasi"
                ).value.trim(),

            tanggal_perolehan:
                document.getElementById(
                    "tanggal_perolehan"
                ).value,

            harga_perolehan:
                Number(
                    document.getElementById(
                        "harga_perolehan"
                    ).value
                ),

            kondisi:
                document.getElementById(
                    "kondisi"
                ).value,

            status_aset:
                document.getElementById(
                    "status_aset"
                ).value

        };


        if (!data.id_kategori) {

            alert("Silakan pilih kategori.");

            return;

        }


        try {

            let error;


            if (id) {

                const result = await db
                    .from("aset")
                    .update(data)
                    .eq(
                        "id_aset",
                        Number(id)
                    );

                error = result.error;

            }

            else {

                const result = await db
                    .from("aset")
                    .insert(data);

                error = result.error;

            }


            if (error) {

                console.error(
                    "SUPABASE ERROR ASET:",
                    error
                );

                alert(
                    "Gagal menyimpan aset:\n\n" +
                    error.message
                );

                return;

            }


            alert("Data aset berhasil disimpan! ✨");


            closeAsetModal();

            await loadAset();

            await loadDashboard();

        }

        catch (error) {

            console.error(error);

            alert(
                "Terjadi error:\n\n" +
                error.message
            );

        }

    });


// ======================================================
// EDIT ASET
// ======================================================

function editAset(id) {

    openAsetModal(id);

}


// ======================================================
// HAPUS ASET
// ======================================================

async function hapusAset(id) {

    const aset =
        semuaAset.find(
            item =>
                Number(item.id_aset) === Number(id)
        );


    if (!aset) {
        return;
    }


    const yakin = confirm(
        `Hapus aset "${aset.nama_aset}"?`
    );


    if (!yakin) {
        return;
    }


    try {

        const { error } = await db
            .from("aset")
            .delete()
            .eq(
                "id_aset",
                Number(id)
            );


        if (error) {

            alert(
                "Gagal menghapus aset:\n\n" +
                error.message
            );

            return;

        }


        alert("Aset berhasil dihapus.");

        await loadAset();

        await loadPelepasan();

        await loadDashboard();

    }

    catch (error) {

        alert(
            "Terjadi error:\n\n" +
            error.message
        );

    }

}


// ======================================================
// FILTER ASET
// ======================================================

function filterAset() {

    const search =
        document.getElementById(
            "searchAset"
        ).value
        .toLowerCase()
        .trim();


    const status =
        document.getElementById(
            "filterStatus"
        ).value;


    const kondisi =
        document.getElementById(
            "filterKondisi"
        ).value;


    const hasil =
        semuaAset.filter(aset => {

            const cocokSearch =

                aset.kode_aset
                    .toLowerCase()
                    .includes(search)

                ||

                aset.nama_aset
                    .toLowerCase()
                    .includes(search);


            const cocokStatus =
                !status ||
                aset.status_aset === status;


            const cocokKondisi =
                !kondisi ||
                aset.kondisi === kondisi;


            return (
                cocokSearch &&
                cocokStatus &&
                cocokKondisi
            );

        });


    renderAset(hasil);

}


// ======================================================
// SELECT PELEPASAN
// ======================================================

function isiSelectPelepasan() {

    const select =
        document.getElementById(
            "pelepasan_id_aset"
        );


    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            Pilih aset
        </option>
    `;


    const asetTersedia =
        semuaAset.filter(
            aset =>
                aset.status_aset !== "Dilepas"
        );


    asetTersedia.forEach(aset => {

        const option =
            document.createElement("option");


        option.value =
            aset.id_aset;


        option.textContent =
            `${aset.kode_aset} - ${aset.nama_aset}`;


        select.appendChild(option);

    });

}


// ======================================================
// 9. PELEPASAN
// ======================================================

function openPelepasanModal() {

    document
        .getElementById("formPelepasan")
        .reset();


    isiSelectPelepasan();


    document.getElementById(
        "modalPelepasan"
    ).classList.add("show");

}


function closePelepasanModal() {

    document.getElementById(
        "modalPelepasan"
    ).classList.remove("show");

}


// ======================================================
// SIMPAN PELEPASAN
// ======================================================

document
    .getElementById("formPelepasan")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const idAset =
            Number(
                document.getElementById(
                    "pelepasan_id_aset"
                ).value
            );


        if (!idAset) {

            alert("Silakan pilih aset.");

            return;

        }


        const data = {

            id_aset:
                idAset,

            tanggal_pelepasan:
                document.getElementById(
                    "tanggal_pelepasan"
                ).value,

            alasan:
                document.getElementById(
                    "alasan"
                ).value,

            nilai_pelepasan:
                Number(
                    document.getElementById(
                        "nilai_pelepasan"
                    ).value
                ),

            keterangan:
                document.getElementById(
                    "keterangan"
                ).value.trim()

        };


        try {

            const result =
                await db
                    .from("pelepasan")
                    .insert(data);


            if (result.error) {

                console.error(
                    "ERROR PELEPASAN:",
                    result.error
                );

                alert(
                    "Gagal menyimpan pelepasan:\n\n" +
                    result.error.message
                );

                return;

            }


            // Setelah pelepasan,
            // status aset menjadi Dilepas.

            const updateAset =
                await db
                    .from("aset")
                    .update({
                        status_aset: "Dilepas"
                    })
                    .eq(
                        "id_aset",
                        idAset
                    );


            if (updateAset.error) {

                alert(
                    "Pelepasan tersimpan, tetapi status aset gagal diperbarui:\n\n" +
                    updateAset.error.message
                );

            }


            alert(
                "Pelepasan aset berhasil dicatat! ✨"
            );


            closePelepasanModal();


            await loadAset();

            await loadPelepasan();

            await loadDashboard();

        }

        catch (error) {

            console.error(error);

            alert(
                "Terjadi error:\n\n" +
                error.message
            );

        }

    });


// ======================================================
// LOAD PELEPASAN
// ======================================================

async function loadPelepasan() {

    try {

        const { data, error } = await db
            .from("pelepasan")
            .select(`
                *,
                aset (
                    kode_aset,
                    nama_aset
                )
            `)
            .order("id_pelepasan", {
                ascending: false
            });


        if (error) {

            console.error(
                "ERROR LOAD PELEPASAN:",
                error
            );

            throw error;

        }


        semuaPelepasan = data || [];


        renderPelepasan();

    }

    catch (error) {

        console.error(error);

        const table =
            document.getElementById(
                "tabelPelepasan"
            );


        if (table) {

            table.innerHTML = `
                <tr>
                    <td colspan="6" class="empty">
                        Gagal mengambil data pelepasan.<br>
                        <small>${error.message}</small>
                    </td>
                </tr>
            `;

        }

    }

}


// ======================================================
// RENDER PELEPASAN
// ======================================================

function renderPelepasan() {

    const table =
        document.getElementById(
            "tabelPelepasan"
        );


    if (!table) {
        return;
    }


    if (semuaPelepasan.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    Belum ada data pelepasan ↗
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        semuaPelepasan.map(item => {

            const aset =
                item.aset || {};


            return `
                <tr>

                    <td>

                        <div class="asset-name">
                            ${escapeHTML(
                                aset.nama_aset || "-"
                            )}
                        </div>

                        <div class="asset-code">
                            ${escapeHTML(
                                aset.kode_aset || "-"
                            )}
                        </div>

                    </td>


                    <td>
                        ${formatTanggal(
                            item.tanggal_pelepasan
                        )}
                    </td>


                    <td>
                        <span class="badge badge-orange">
                            ${escapeHTML(
                                item.alasan
                            )}
                        </span>
                    </td>


                    <td>
                        ${rupiah(
                            item.nilai_pelepasan
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            item.keterangan || "-"
                        )}
                    </td>


                    <td>

                        <button
                            class="btn-action btn-delete"
                            onclick="hapusPelepasan(${item.id_pelepasan})">
                            ×
                        </button>

                    </td>

                </tr>
            `;

        }).join("");

}


// ======================================================
// HAPUS PELEPASAN
// ======================================================

async function hapusPelepasan(id) {

    const yakin = confirm(
        "Hapus data pelepasan ini?"
    );


    if (!yakin) {
        return;
    }


    try {

        const { error } =
            await db
                .from("pelepasan")
                .delete()
                .eq(
                    "id_pelepasan",
                    Number(id)
                );


        if (error) {

            alert(
                "Gagal menghapus:\n\n" +
                error.message
            );

            return;

        }


        alert(
            "Data pelepasan berhasil dihapus."
        );


        await loadPelepasan();

    }

    catch (error) {

        alert(
            "Terjadi error:\n\n" +
            error.message
        );

    }

}


// ======================================================
// 10. DASHBOARD
// ======================================================

async function loadDashboard() {

    const total =
        semuaAset.length;


    const aktif =
        semuaAset.filter(
            aset =>
                aset.status_aset === "Aktif"
        ).length;


    const tidakAktif =
        semuaAset.filter(
            aset =>
                aset.status_aset === "Tidak Aktif"
        ).length;


    const dilepas =
        semuaAset.filter(
            aset =>
                aset.status_aset === "Dilepas"
        ).length;


    const totalNilai =
        semuaAset.reduce(
            (total, aset) =>
                total +
                Number(
                    aset.harga_perolehan
                ),
            0
        );


    document.getElementById(
        "totalAset"
    ).textContent = total;


    document.getElementById(
        "asetAktif"
    ).textContent = aktif;


    document.getElementById(
        "asetTidakAktif"
    ).textContent = tidakAktif;


    document.getElementById(
        "asetDilepas"
    ).textContent = dilepas;


    document.getElementById(
        "totalNilai"
    ).textContent =
        rupiah(totalNilai);


    renderAsetTerbaru();

    renderJumlahKategori();

}


// ======================================================
// ASET TERBARU
// ======================================================

function renderAsetTerbaru() {

    const table =
        document.getElementById(
            "asetTerbaru"
        );


    if (!table) {
        return;
    }


    const data =
        semuaAset.slice(0, 5);


    if (data.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="4" class="empty">
                    Belum ada aset 📦
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        data.map(aset => {

            const kategori =
                aset.kategori
                    ? aset.kategori.nama_kategori
                    : "-";


            return `
                <tr>

                    <td>

                        <div class="asset-name">
                            ${escapeHTML(
                                aset.nama_aset
                            )}
                        </div>

                        <div class="asset-code">
                            ${escapeHTML(
                                aset.kode_aset
                            )}
                        </div>

                    </td>


                    <td>
                        ${escapeHTML(kategori)}
                    </td>


                    <td>
                        ${badgeKondisi(
                            aset.kondisi
                        )}
                    </td>


                    <td>
                        ${badgeStatus(
                            aset.status_aset
                        )}
                    </td>

                </tr>
            `;

        }).join("");

}


// ======================================================
// JUMLAH KATEGORI DASHBOARD
// ======================================================

function renderJumlahKategori() {

    const komputer =
        semuaAset.filter(
            aset =>
                aset.kategori &&
                aset.kategori.nama_kategori
                    .toLowerCase() === "komputer"
        ).length;


    const furniture =
        semuaAset.filter(
            aset =>
                aset.kategori &&
                aset.kategori.nama_kategori
                    .toLowerCase() === "furniture"
        ).length;


    const elektronik =
        semuaAset.filter(
            aset =>
                aset.kategori &&
                aset.kategori.nama_kategori
                    .toLowerCase() === "elektronik"
        ).length;


    document.getElementById(
        "jumlahKomputer"
    ).textContent =
        komputer + " aset";


    document.getElementById(
        "jumlahFurniture"
    ).textContent =
        furniture + " aset";


    document.getElementById(
        "jumlahElektronik"
    ).textContent =
        elektronik + " aset";

}


// ======================================================
// 11. ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ======================================================
// 12. TUTUP MODAL KETIKA KLIK LUAR
// ======================================================

window.addEventListener(
    "click",
    function(event) {

        if (
            event.target.classList.contains(
                "modal"
            )
        ) {

            event.target.classList.remove(
                "show"
            );

        }

    }
);


// ======================================================
// 13. INITIALIZE
// ======================================================

async function init() {

    console.log(
        "Assetly sedang dijalankan..."
    );


    tampilkanTanggal();


    if (
        SUPABASE_URL ===
        "MASUKKAN_PROJECT_URL_KAMU"
    ) {

        console.warn(
            "Supabase URL belum diisi."
        );

        return;

    }


    try {

        await loadKategori();

        await loadAset();

        await loadPelepasan();

        await loadDashboard();


        console.log(
            "Assetly berhasil terhubung ke Supabase."
        );

    }

    catch (error) {

        console.error(
            "Gagal menjalankan aplikasi:",
            error
        );

    }

}


init();
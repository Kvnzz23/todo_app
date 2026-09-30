import "./style.css";

// 1. Tipe data dan State
interface Todo {
  id: number;
  teks: string;
  selesai: boolean;
}

type FilterStatus = "semua" | "aktif" | "selesai";

let filterAktif: FilterStatus = "semua";
let todos: Todo[] = muatDariStorage();

// 2. Ambil Elemen DOM
const form = document.getElementById("todo-form") as HTMLFormElement;
const input = document.getElementById("todo-input") as HTMLInputElement;
const list = document.getElementById("todo-list") as HTMLUListElement;
const stat = document.getElementById("jumlah-tersisa") as HTMLSpanElement;
const tombolFilter =
  document.querySelectorAll<HTMLButtonElement>("#filter-bar button");

// 3. Fungsi Penyimpanan (localStorage) dengan Validasi & Type Predicate
const KUNCI_STORAGE = "todos";

function simpanKeStorage(): void {
  localStorage.setItem(KUNCI_STORAGE, JSON.stringify(todos));
}

function muatDariStorage(): Todo[] {
  try {
    const data = localStorage.getItem(KUNCI_STORAGE);
    if (!data) return [];

    const hasil = JSON.parse(data);
    if (!Array.isArray(hasil)) return [];

    return hasil.filter(
      (item): item is Todo =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "number" &&
        typeof item.teks === "string" &&
        typeof item.selesai === "boolean",
    );
  } catch {
    return [];
  }
}

// 4. Logika Aplikasi (Aksi Todo)
function tambahTodo(teks: string): void {
  const todoBaru: Todo = {
    id: Date.now(),
    teks: teks,
    selesai: false,
  };
  todos.push(todoBaru);
  simpanKeStorage();
  render();
}

function ubahStatus(id: number): void {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, selesai: !todo.selesai } : todo,
  );
  simpanKeStorage();
  render();
}

function editTodo(id: number, teksBaru: string): void {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, teks: teksBaru } : todo,
  );
  simpanKeStorage();
  render();
}

function hapusTodo(id: number): void {
  todos = todos.filter((todo) => todo.id !== id);
  simpanKeStorage();
  render();
}

// 5. Menampilkan Data ke Layar (Render)
function render(): void {
  list.innerHTML = "";

  const jumlahTugas = todos.filter((todo) => !todo.selesai).length;
  stat.textContent = `${jumlahTugas} tugas tersisa`;

  const todosTampil = todos.filter((todo) => {
    if (filterAktif === "aktif") return !todo.selesai;
    if (filterAktif === "selesai") return todo.selesai;
    return true; // "semua"
  });

  todosTampil.forEach((todo) => {
    const li = document.createElement("li");
    li.className = todo.selesai ? "todo-item selesai" : "todo-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.selesai;
    checkbox.addEventListener("change", () => ubahStatus(todo.id));

    const span = document.createElement("span");
    span.className = "teks";
    span.textContent = todo.teks;

    const tombolEdit = document.createElement("button");
    tombolEdit.className = "edit";
    tombolEdit.textContent = "Edit";
    tombolEdit.addEventListener("click", () => {
      const teksBaru = prompt("Ubah tugas:", todo.teks);
      if (teksBaru !== null && teksBaru.trim() !== "") {
        editTodo(todo.id, teksBaru.trim());
      }
    });

    const tombolHapus = document.createElement("button");
    tombolHapus.className = "hapus";
    tombolHapus.textContent = "Hapus";
    tombolHapus.addEventListener("click", () => hapusTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(tombolEdit);
    li.appendChild(tombolHapus);
    list.appendChild(li);
  });
}

// 6. Event Listeners
form.addEventListener("submit", (event: SubmitEvent) => {
  event.preventDefault();
  const teks = input.value.trim();
  if (teks === "") return;

  tambahTodo(teks);
  input.value = "";
  input.focus();
});

tombolFilter.forEach((tombol) => {
  tombol.addEventListener("click", () => {
    filterAktif = tombol.dataset.filter as FilterStatus;
    render();
  });
});

// Render awal saat aplikasi dimuat
render();

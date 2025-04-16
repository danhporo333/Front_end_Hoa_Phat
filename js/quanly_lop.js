import { BASE_URL } from "./config.js";
// Get DOM elements
const toggleButton = document.getElementById("toggle-button");
const dashboard = document.getElementById("dashboard");
const addClassModal = document.getElementById("addClassModal");
const addClassButton = document.getElementById("add-class-button");
const closeAddClassModal = document.querySelector("#addClassModal .close");
const addClassForm = document.getElementById("classForm");

// Toggle dashboard collapse
toggleButton.addEventListener("click", () => {
  dashboard.classList.toggle("collapsed");
});

// Open "Thêm lớp" modal
addClassButton.addEventListener("click", () => {
  addClassModal.style.display = "block";
});

// Close "Thêm lớp" modal when clicking (x)
closeAddClassModal.addEventListener("click", () => {
  addClassModal.style.display = "none";
});

// Close "Thêm lớp" modal when clicking outside
window.addEventListener("click", (event) => {
  if (event.target === addClassModal) {
    addClassModal.style.display = "none";
  }
});

//lấy danh sách lớp
fetch(`${BASE_URL}/v1/api/allclass`)
  .then((response) => response.json())
  .then((data) => {
    if (data && data.data && data.data.classes) {
      const classList = data.data.classes;
      const tableBody = document.querySelector("#class-table tbody");

      classList.forEach((cls) => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${cls.malop}</td>
          <td>${cls.tenlop}</td>
          <td>${cls.siso}</td>
          <td>${cls.khoaVien.tenkv}</td>
          <td>
            <button class="edit-btn" data-id="${cls.malop}">Sửa</button>
            <button class="delete-btn" data-id="${cls.malop}">Xóa</button>
          </td>
        `;

        tableBody.appendChild(row);
      });

      // Handle edit button click
      document.querySelectorAll(".edit-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
          const malop = e.target.dataset.id;
          const cls = classList.find((item) => item.malop === malop);

          if (cls) {
            document.getElementById("editmalop").value = cls.malop;
            document.getElementById("edittenlop").value = cls.tenlop;
            document.getElementById("editsiso").value = cls.siso;
            document.getElementById("editkv").value = cls.khoaVien.makv;

            document.getElementById("editClassModal").style.display = "block";
          }
        });
      });

      // Handle delete button click
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", async (e) => {
          const malop = e.target.dataset.id;

          if (confirm("Bạn có chắc chắn muốn xóa lớp này?")) {
            try {
              const response = await fetch(
                `${BASE_URL}/v1/api/deleteclass/${malop}`,
                {
                  method: "DELETE",
                }
              );

              if (response.ok) {
                alert("Xóa lớp thành công!");
                location.reload();
              } else {
                alert("Có lỗi xảy ra khi xóa lớp!");
              }
            } catch (error) {
              console.error("Error:", error);
              alert("Có lỗi xảy ra khi xóa lớp!");
            }
          }
        });
      });
    } else {
      console.error("Dữ liệu trả về không đúng định dạng.");
    }
  })
  .catch((error) => {
    console.error("Lỗi khi gọi API:", error);
  });

// xử lý sự kiện khi nhấn nút "Thêm lớp"
document.querySelector("#classForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // Ngăn chặn hành vi mặc định của form

  const formData = {
    // malop: document.getElementById("editmalop").value.trim(),
    tenlop: document.getElementById("tenlop").value.trim(),
    siso: parseInt(document.getElementById("siso").value.trim()),
    makv: document.getElementById("makv").value.trim(),
  };
  console.log("Form data:", formData); // Debugging log

  // Validate required fields
  if (!formData.tenlop || isNaN(formData.siso) || !formData.makv) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  try {
    console.log("Sending create request with data:", formData); // Debugging log
    const response = await fetch(`${BASE_URL}/v1/api/createclass`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert("Thêm lớp thành công!");
      document.getElementById("addClassModal").style.display = "none"; // Đóng modal
      document.getElementById("classForm").reset(); // Reset form
      location.reload(); // Tải lại trang để cập nhật danh sách
    } else {
      const errorData = await response.json();
      console.error("API error response:", errorData); // Debugging log
      alert(
        `Có lỗi xảy ra khi thêm lớp: ${errorData.message || "Không rõ lỗi"}`
      );
    }
  } catch (error) {
    console.error("Network or other error:", error); // Debugging log
    alert("Có lỗi xảy ra khi thêm lớp! Vui lòng thử lại.");
  }
});

// Xử lý sự kiện khi nhấn nút "Cập nhật lớp"
document
  .querySelector("#editClassForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
      malop: document.getElementById("editmalop").value.trim(),
      tenlop: document.getElementById("edittenlop").value.trim(),
      siso: document.getElementById("editsiso").value.trim(),
      makv: document.getElementById("editkv").value.trim(),
    };

    try {
      const response = await fetch(`${BASE_URL}/v1/api/updateclass`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Cập nhật lớp thành công!");
        document.getElementById("editClassModal").style.display = "none";
        location.reload();
      } else {
        alert("Có lỗi xảy ra khi cập nhật lớp!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Có lỗi xảy ra khi cập nhật lớp!");
    }
  });

// Modal close functionality
document.querySelectorAll(".close").forEach((closeBtn) => {
  closeBtn.addEventListener("click", () => {
    closeBtn.parentElement.parentElement.style.display = "none";
  });
});

window.addEventListener("click", (event) => {
  if (event.target.classList.contains("modal")) {
    event.target.style.display = "none";
  }
});

// Fetch and populate Khoa viện options
fetch(`${BASE_URL}/v1/api/all`)
  .then((response) => response.json())
  .then((data) => {
    if (data && data.data && data.data.khoavien) {
      const khoaVienList = data.data.khoavien;
      const makvSelect = document.getElementById("makv"); //all cho add class
      const editkvSelect = document.getElementById("editkv"); //edit cho edit class

      khoaVienList.forEach((kv) => {
        const option = document.createElement("option");
        option.value = kv.makv;
        option.textContent = kv.tenkv;
        makvSelect.appendChild(option);
        editkvSelect.appendChild(option.cloneNode(true)); // Clone option for edit select
      });
    } else {
      console.error("Dữ liệu khoa viện trả về không đúng định dạng.");
    }
  })
  .catch((error) => {
    console.error("Lỗi khi gọi API khoa viện:", error);
  });

import { BASE_URL } from "./config.js"; // Import BASE_URL from config.js

// Get DOM elements
const toggleButton = document.getElementById("toggle-button");
const dashboard = document.getElementById("dashboard");
const modal = document.getElementById("addKhoaVienModal");
const closeBtn = modal.querySelector(".close");
const addAccountButton = document.getElementById("add-account-button");
const khoaVienForm = document.getElementById("khoaVienForm");

// Toggle dashboard collapse
toggleButton.addEventListener("click", () => {
  dashboard.classList.toggle("collapsed");
});

// Open modal
addAccountButton.addEventListener("click", () => {
  modal.style.display = "block";
});

// Close modal when clicking (x)
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Close modal when clicking outside
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Gọi API để lấy danh sách khoa viện
fetch(`${BASE_URL}/v1/api/all`)
  .then((response) => response.json())
  .then((data) => {
    if (data && data.data && data.data.khoavien) {
      const khoavienList = data.data.khoavien;
      const tableBody = document.querySelector("#khoavien-table tbody");

      khoavienList.forEach((kv) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${kv.makv}</td>
            <td>${kv.tenkv}</td>
            <td>${kv.dtkv}</td>
            <td>${kv.diaChi}</td>
            <td>${kv.lop.length}</td>
            <td>
              <button class="edit-btn" data-id="${kv.makv}">Sửa</button>
              <button class="delete-btn" data-id="${kv.makv}">Xóa</button>
            </td>
          `;

        tableBody.appendChild(row);
      });

      // Xử lý sự kiện khi nhấn nút "Sửa"
      document.querySelectorAll(".edit-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
          const makv = e.target.dataset.id; // Lấy mã khoa viện từ thuộc tính data-id
          console.log(makv); // In mã khoa viện ra console để kiểm tra
          const kv = khoavienList.find((item) => item.makv === makv); // Tìm khoa viện tương ứng

          if (kv) {
            // Điền thông tin khoa viện vào form
            document.querySelector("#createKhoaVienModal #makv").value =
              kv.makv;
            document.querySelector("#createKhoaVienModal #tenkv").value =
              kv.tenkv;
            document.querySelector("#createKhoaVienModal #dtkv").value =
              kv.dtkv;
            document.querySelector("#createKhoaVienModal #diaChi").value =
              kv.diaChi;

            document.getElementById("createKhoaVienModal").style.display =
              "block"; // Hiển thị modal1
          }
        });
      });

      // Đóng modal1 khi nhấn vào nút đóng
      document
        .querySelector("#createKhoaVienModal .close")
        .addEventListener("click", () => {
          document.getElementById("createKhoaVienModal").style.display = "none";
        });

      // Đóng modal1 khi nhấn ra ngoài
      window.addEventListener("click", (event) => {
        const modal1 = document.getElementById("createKhoaVienModal");
        if (event.target == modal1) {
          modal1.style.display = "none";
        }
      });

      // Xử lý sự kiện khi nhấn nút "Xóa"
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", async (e) => {
          const makv = e.target.dataset.id; // Lấy mã khoa viện từ thuộc tính data-id

          if (confirm("Bạn có chắc chắn muốn xóa khoa viện này?")) {
            try {
              // Gửi yêu cầu xóa khoa viện đến API
              const response = await fetch(
                `${BASE_URL}/v1/api/deletekhoa_vien/${makv}`,
                {
                  method: "DELETE",
                }
              );

              if (response.ok) {
                alert("Xóa khoa viện thành công!");
                location.reload(); // Tải lại trang để cập nhật danh sách
              } else {
                alert("Có lỗi xảy ra khi xóa khoa viện!");
              }
            } catch (error) {
              console.error("Error:", error);
              alert("Có lỗi xảy ra khi xóa khoa viện!");
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

// Xử lý sự kiện khi nhấn nút "Thêm khoa viện"
document
  .querySelector("#addKhoaVienModal form")
  .addEventListener("submit", async (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form

    const formData = {
      tenkv: document.querySelector("#addKhoaVienModal #tenkv").value,
      diaChi: document.querySelector("#addKhoaVienModal #diaChi").value,
    };

    try {
      const response = await fetch(`${BASE_URL}/v1/api/createkhoa_vien`, {
        method: "POST", // Phương thức thêm mới
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Gửi dữ liệu dưới dạng JSON
      });

      if (response.ok) {
        alert("Thêm khoa viện thành công!");
        document.getElementById("addKhoaVienModal").style.display = "none"; // Đóng modal
        location.reload(); // Tải lại trang để cập nhật danh sách
      } else {
        alert("Có lỗi xảy ra khi thêm khoa viện!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Có lỗi xảy ra khi thêm khoa viện!");
    }
  });

// Xử lý sự kiện khi nhấn nút "Cập nhật khoa viện"
document
  .querySelector("#createKhoaVienModal form")
  .addEventListener("submit", async (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form

    const formData = {
      makv: document.querySelector("#createKhoaVienModal #makv").value.trim(), // Include mã khoa viện
      tenkv: document.querySelector("#createKhoaVienModal #tenkv").value.trim(),
      dtkv: document.querySelector("#createKhoaVienModal #dtkv").value.trim(),
      diaChi: document
        .querySelector("#createKhoaVienModal #diaChi")
        .value.trim(),
    };

    // Validate required fields
    if (
      !formData.makv ||
      !formData.tenkv ||
      !formData.dtkv ||
      !formData.diaChi
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      console.log("Sending update request with data:", formData); // Debugging log
      const response = await fetch(`${BASE_URL}/v1/api/updatekhoa_vien`, {
        method: "PUT", // Phương thức cập nhật
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Gửi dữ liệu dưới dạng JSON
      });

      if (response.ok) {
        alert("Cập nhật khoa viện thành công!");
        document.getElementById("createKhoaVienModal").style.display = "none"; // Đóng modal1
        location.reload(); // Tải lại trang để cập nhật danh sách
      } else {
        const errorData = await response.json();
        console.error("API error response:", errorData); // Debugging log
        alert(
          `Có lỗi xảy ra khi cập nhật khoa viện: ${
            errorData.message || "Không rõ lỗi"
          }`
        );
      }
    } catch (error) {
      console.error("Network or other error:", error); // Debugging log
      alert("Có lỗi xảy ra khi cập nhật khoa viện! Vui lòng thử lại.");
    }
  });

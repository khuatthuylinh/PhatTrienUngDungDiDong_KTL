const apiBase = 'https://6acdeafaf338359cf1c2a15e.mockapi.io';
const trailerUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

const categorySeeds = [
  { name: 'Lập trình Mobile', description: 'Android, Flutter, React Native' },
  { name: 'Lập trình Web', description: 'Frontend và Backend' },
  { name: 'Trí tuệ nhân tạo', description: 'AI, Machine Learning, Deep Learning' },
];

const courseSeeds = [
  ['Lập trình Android cơ bản', 'Xây dựng ứng dụng Android với Kotlin và Jetpack Compose.', 0, 'Nguyễn Văn A', 500000, 30, 'photo-1516321318423-f06f85e504b3'],
  ['Flutter từ số 0', 'Phát triển ứng dụng đa nền tảng với Flutter và Dart.', 0, 'Trần Minh Khoa', 650000, 36, 'photo-1518770660439-4636190af475'],
  ['React Native thực chiến', 'Tạo ứng dụng di động với React Native và Expo.', 0, 'Lê Hoàng Nam', 720000, 42, 'photo-1555949963-ff9fe0c870eb'],
  ['Thiết kế giao diện mobile', 'Nguyên tắc UX và xây dựng giao diện cho thiết bị di động.', 0, 'Phạm Ngọc Mai', 450000, 24, 'photo-1558655146-d09347e92766'],
  ['HTML và CSS hiện đại', 'Từ bố cục responsive đến hiệu ứng giao diện web.', 1, 'Đỗ Thành Long', 390000, 20, 'photo-1498050108023-c5249f4df085'],
  ['JavaScript nền tảng', 'Nắm vững JavaScript để xây dựng ứng dụng web tương tác.', 1, 'Vũ Thu Hà', 520000, 32, 'photo-1484417894907-623942c8ee29'],
  ['Backend với Node.js', 'Thiết kế REST API và xử lý dữ liệu phía máy chủ.', 1, 'Nguyễn Quốc Bảo', 780000, 40, 'photo-1555066931-4365d14bab8c'],
  ['Machine Learning nhập môn', 'Các thuật toán học máy và quy trình huấn luyện mô hình.', 2, 'Trương Gia Huy', 890000, 44, 'photo-1555949963-aa79dcee981c'],
  ['Python cho khoa học dữ liệu', 'Phân tích dữ liệu với Python, NumPy và Pandas.', 2, 'Hoàng Bích Ngọc', 690000, 34, 'photo-1526378722484-bd91ca387e72'],
  ['Deep Learning căn bản', 'Mạng nơ-ron, computer vision và ứng dụng thực tế.', 2, 'Phan Minh Đức', 990000, 50, 'photo-1519389950473-47ba0277781c'],
];

async function get(path) {
  const response = await fetch(`${apiBase}${path}`);
  if (!response.ok) throw new Error(`GET ${path} failed (${response.status})`);
  return response.json();
}

async function post(path, data) {
  const response = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`POST ${path} failed (${response.status})`);
  return response.json();
}

async function main() {
  const categories = await get('/categories');
  for (const seed of categorySeeds) {
    if (!categories.some((category) => category.name.trim().toLocaleLowerCase('vi') === seed.name.toLocaleLowerCase('vi'))) {
      categories.push(await post('/categories', seed));
      console.log(`Created category: ${seed.name}`);
    }
  }

  const courses = await get('/courses');
  const missing = Math.max(0, 10 - courses.length);
  const today = new Date().toISOString().slice(0, 10);
  for (const [title, description, categoryIndex, instructor, price, duration, imageId] of courseSeeds.slice(0, missing)) {
    const category = categories.find((item) => item.name.trim().toLocaleLowerCase('vi') === categorySeeds[categoryIndex].name.toLocaleLowerCase('vi'));
    if (!category) throw new Error(`Missing category: ${categorySeeds[categoryIndex].name}`);
    await post('/courses', {
      title,
      description,
      categoryId: category.id,
      instructor,
      price,
      duration,
      thumbnail: `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=900&q=85`,
      trailerUrl,
      createdAt: today,
    });
    console.log(`Created course: ${title}`);
  }

  console.log(`Done. ${categories.length} categories, ${courses.length + missing} courses.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
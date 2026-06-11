import fetch from 'node-fetch';

async function run() {
  const categoriesRes = await fetch('http://localhost:8080/api/v1/categories');
  const categoriesJson = await categoriesRes.json();
  
  if (categoriesJson && categoriesJson.status && categoriesJson.data) {
    console.log("Categories unwrapped:", categoriesJson.data.length);
    const matched = categoriesJson.data.find(c => c.slug.toLowerCase() === 'electronics');
    if (matched) {
      console.log("Matched cat:", matched.id);
      const prodRes = await fetch(`http://localhost:8080/api/v1/products?categoryId=${matched.id}&page=0&size=100&inStock=false`);
      const prodJson = await prodRes.json();
      if (prodJson && prodJson.data && prodJson.data.content) {
        console.log("Products unwrapped:", prodJson.data.content.length);
      } else {
        console.log("Products unexpected:", prodJson);
      }
    }
  } else {
    console.log("Categories unexpected:", categoriesJson);
  }
}
run();

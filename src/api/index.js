export const uploadImageToImgur = async (imageData) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Client-ID 1ed9fa718986c4d");
  
    var formdata = new FormData();
    formdata.append("image", imageData);
  
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow'
    };
  
    const response = await fetch("https://api.imgur.com/3/image", requestOptions)
    return response.text()
  
}
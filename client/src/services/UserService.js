import axios from "axios"
export default {
  async getUsers(accessToken) {
    let res = await axios.get("http://localhost:8000/users",{
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    console.log(res.data)
    return res.data
  },
  async deleteUser(accessToken, id) {
    let res = await axios.get(`http://localhost:8000/users/${id}/delete`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    return res.data
  }
}
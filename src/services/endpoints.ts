const API_ENDPOINTS = {
  //todo -> first make backend then use these endpoints
  sample: "/sample",

  /**User Endpoint */
  addUser: "/users/add-user",

  /**Room Endpoint */
  createRoom: "/rooms/create",
  joinRoom: "/rooms/join",
  
  getRoomInfo: (code: string) => `/rooms/${code}`


};

export default API_ENDPOINTS;

class UserDto{
    constructor({name, age, username}){
        this.fullname = `${name}`,
        this.age = age,
        this.email = `${username}`
    }
}


export const convertToDto = (users)=>{
    if(Array.isArray(users)){
        const newData = users.map(user=>new UserDto(user));
        return newData;
    } else {
        const newData = new UserDto(users);
        return newData;
    }
}
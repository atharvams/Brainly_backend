

export function hashGenerator(length: number){
    const randomString = "qwertyuiopasdfghjklzxcvbnm1234567890"
    let hash= ""
    for(let i=0; i<length; i++){
        hash += randomString[Math.floor(Math.random()*length)];
    }

    return hash;
}
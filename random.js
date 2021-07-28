let s = ''
for(let i = 0; i<11;i++){
    function decimalToHexString(number)
    {
    if (number < 0)
    {
        number = 0xFFFFFFFF + number + 1;
    }

    return number.toString(16).toUpperCase();
    }
    s = s.concat(decimalToHexString(Math.floor(Math.random()*255)));
    s = s.concat(" ");
    
}
console.log(s);
function myfunc() {
  let inputnum = document.getElementById("inputnum").value;

  if (inputnum == "") {
    alert("Enter the number");
    return;
  }

  let ans = factorial(inputnum);

  document.getElementById("output").innerText = "Output: " + ans;

  console.log("ans : ", ans);
}

function multiply(arr, multiplier) {
  let carry = 0;
  for (let i = 0; i < arr.length; i++) {
    const product = arr[i] * multiplier + carry;
    arr[i] = product % 100;
    carry = Math.floor(product / 100);
  }

  while (carry > 0) {
    arr.push(carry % 100);
    carry = Math.floor(carry / 100);
  }

  // console.log("arr : " + arr.reverse().join(""));

  return arr;
}

function factorial(n) {
  let result = [1];

  for (let i = 2; i <= n; i++) {
    multiply(result, i);
    // console.log("result : " + result.reverse().join(""));
  }
  for (let i = 0; i < result.length - 1; i++) {
    let flag = result[i];
    while (flag < 10 && result[i] > 0) {
      flag *= 10;
      result[i + 1] *= 10;
    }
  }

  return result.reverse().join("");
}


const ONES_EN = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const TEENS_EN = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS_EN = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const GROUPS_EN = ["", "thousand", "million", "billion", "trillion", "quadrillion"];

const DIGITS_VI = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
const GROUPS_VI = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"]; // Simplified for up to reasonable limit

export function toEnglish(num: number | string): string {
  const n = typeof num === 'string' ? parseInt(num, 10) : num;
  if (isNaN(n)) return "";
  if (n === 0) return "zero";

  return convertGroupEn(n);
}

function convertGroupEn(n: number): string {
  if (n === 0) return "";
  
  let words = "";
  let groupIndex = 0;
  
  while (n > 0) {
    const remainder = n % 1000;
    if (remainder !== 0) {
      const groupWords = convertThreeDigitsEn(remainder);
      words = groupWords + (GROUPS_EN[groupIndex] ? " " + GROUPS_EN[groupIndex] : "") + (words ? " " + words : "");
    }
    n = Math.floor(n / 1000);
    groupIndex++;
  }
  
  return words.trim();
}

function convertThreeDigitsEn(n: number): string {
  let words = "";
  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;
  
  if (hundreds > 0) {
    words += ONES_EN[hundreds] + " hundred";
    if (remainder > 0) words += " ";
  }
  
  if (remainder > 0) {
    if (remainder < 10) {
      words += ONES_EN[remainder];
    } else if (remainder < 20) {
      words += TEENS_EN[remainder - 10];
    } else {
      const tens = Math.floor(remainder / 10);
      const ones = remainder % 10;
      words += TENS_EN[tens];
      if (ones > 0) words += "-" + ONES_EN[ones];
    }
  }
  
  return words;
}

export function toVietnamese(num: number | string): string {
  const n = typeof num === 'string' ? parseInt(num, 10) : num;
  if (isNaN(n)) return "";
  if (n === 0) return "không";

  const s = n.toString();
  const groups: string[] = [];
  
  // Split into groups of 3 from right to left
  for (let i = s.length; i > 0; i -= 3) {
    groups.unshift(s.substring(Math.max(0, i - 3), i));
  }
  
  let words: string[] = [];
  
  for (let i = 0; i < groups.length; i++) {
    const groupVal = parseInt(groups[i], 10);
    const isLastGroup = i === groups.length - 1;
    const groupLevel = groups.length - 1 - i; // 0 for units, 1 for thousand, etc.
    
    // Skip empty groups unless it's the only group (handled by n=0 check)
    // But in Vietnamese, intermediate zeros might need reading depending on context,
    // usually handled by "không trăm..." if needed inside the group logic,
    // but groups themselves are skipped if 000, EXCEPT if we need to bridge?
    // Actually, if 1000001 -> một triệu không trăm linh một.
    // The logic is tricky for "không trăm" bridge.
    
    if (groupVal === 0 && !isLastGroup) continue;

    // Determine if we need to read "không trăm" for this group
    // We read hundreds digit if:
    // 1. It's not the first group (i > 0)
    // 2. OR it is the first group but has 3 digits (implicit in readThreeDigitsVi logic?)
    
    const readFull = i > 0; 
    const groupWords = readThreeDigitsVi(groups[i], readFull && groupVal > 0);
    
    if (groupWords.length > 0) {
      words.push(groupWords);
      if (GROUPS_VI[groupLevel]) {
        words.push(GROUPS_VI[groupLevel]);
      }
    } else if (groupVal === 0 && i > 0 && i < groups.length - 1) {
       // If a middle group is 000, we usually skip it in standard reading like "1.000.000" -> một triệu.
       // "1.000.001" -> một triệu không trăm linh một? No, 1.000.001 is "một triệu không nghìn không trăm linh một" is too verbose.
       // usually "một triệu không trăm linh một" (skipping thousands).
       // Simpler rule: if group is 0, skip.
    }
  }
  
  // Clean up simplified logic issues:
  // "1000001" -> "1" "000" "001" -> "một triệu" ... "không trăm linh một"
  // If we just concatenate: "một triệu không trăm linh một".
  
  return words.join(" ").trim();
}

function readThreeDigitsVi(s: string, readHundreds: boolean): string {
  let padded = s.padStart(3, '0');
  let hundreds = parseInt(padded[0], 10);
  let tens = parseInt(padded[1], 10);
  let ones = parseInt(padded[2], 10);
  
  let res: string[] = [];
  
  // Hundreds
  if (readHundreds || hundreds > 0) {
    res.push(DIGITS_VI[hundreds]);
    res.push("trăm");
  }
  
  // Tens and Ones
  if (tens === 0 && ones === 0) {
    // nothing more if ends in 00
  } else if (tens === 0 && ones > 0) {
    // x0x -> linh/lẻ x
    if (readHundreds || hundreds > 0) {
       res.push("linh"); // North: linh, South: lẻ
    }
    res.push(DIGITS_VI[ones]);
  } else if (tens === 1) {
    // x1x -> mười x
    res.push("mười");
    if (ones === 1) res.push("một"); 
    else if (ones === 5) res.push("lăm");
    else if (ones > 0) res.push(DIGITS_VI[ones]);
  } else {
    // tens >= 2
    res.push(DIGITS_VI[tens]);
    res.push("mươi");
    if (ones === 1) res.push("mốt");
    else if (ones === 4) res.push("tư"); // or bốn
    else if (ones === 5) res.push("lăm");
    else if (ones > 0) res.push(DIGITS_VI[ones]);
  }
  
  return res.join(" ");
}

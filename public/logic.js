

const companyTypeSelect = document.getElementById('companyType');
const feeGradeSelect = document.getElementById('feeGrade');
const renewalDateInput = document.getElementById('renewalDate');
const calculateFeeButton = document.getElementById('calculateFee');
const feeResultParagraph = document.getElementById('feeResult');

const fees = {
  zambian: {
    grade1: 16666.80,
    grade2: 12500.10,
    grade3: 8333.40,
    grade4: 2499.90,
    grade5: 1250.10,
    grade6: 833.40
  },
  foreign: {
    annual: {
      grade1: 100000,
      grade2: 75000
    }
  },
  specialist: {
    local: {
      registration: {
        classA: 7750,
        classB: 1875
      },
      express: {
        classA: 15500,
        classB: 3750
      }
    },
    foreign: {
      registration: {
        classA: 100000
      },
      express: {
        classA: 200000
      }
    }
  }
};

companyTypeSelect.addEventListener('change', () => {
  const companyType = companyTypeSelect.value;
  feeGradeSelect.innerHTML = '<option value="">Select Grade</option>';

  if (companyType === 'zambian') {
    Object.keys(fees.zambian).forEach(grade => {
      const option = document.createElement('option');
      option.value = grade;
      option.text = grade.charAt(0).toUpperCase() + grade.slice(1);
      feeGradeSelect.appendChild(option);
    });
  } else if (companyType === 'foreign') {
    Object.keys(fees.foreign.annual).forEach(grade => {
      const option = document.createElement('option');
      option.value = grade;
      option.text = grade.charAt(0).toUpperCase() + grade.slice(1);
      feeGradeSelect.appendChild(option);
    });
  } else if (companyType === 'specialist_local') {
    ['Class A', 'Class B'].forEach((classValue, index) => {
      const option = document.createElement('option');
      option.value = `class${String.fromCharCode(65 + index).toLowerCase()}`;
      option.text = classValue;
      feeGradeSelect.appendChild(option);
    });
  } else if (companyType === 'specialist_foreign') {
    const option = document.createElement('option');
    option.value = 'classA';
    option.text = 'Class A';
    feeGradeSelect.appendChild(option);
  }
});

calculateFeeButton.addEventListener('click', () => {
  const companyType = companyTypeSelect.value;
  const feeGrade = feeGradeSelect.value;
  const renewalDate = new Date(renewalDateInput.value);
  const january14 = new Date(renewalDate.getFullYear(), 0, 14);
  let renewalFee;

  if (companyType === 'zambian') {
    renewalFee = fees.zambian[feeGrade];
  } else if (companyType === 'foreign') {
    renewalFee = fees.foreign.annual[feeGrade];
  } else if (companyType === 'specialist_local') {
    renewalFee = fees.specialist.local.registration[feeGrade];
  } else if (companyType === 'specialist_foreign') {
    renewalFee = fees.specialist.foreign.registration[feeGrade];
  }


function numberToWords(amount) {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const scales = ["", "Thousand", "Million", "Billion"];

  function convertChunk(num) {
    let words = "";
    if (num>= 100) {
      words += ones[Math.floor(num / 100)] + " Hundred";
      num %= 100;
      if (num) words += " and ";
}
    if (num>= 20) {
      words += tens[Math.floor(num / 10)];
      num %= 10;
      if (num) words += " " + ones[num];
} else if (num>= 10) {
      words += teens[num - 10];
} else if (num> 0) {
      words += ones[num];
}
    return words;
}

  function convertWholeNumber(num) {
    if (num === 0) return "Zero";
    let chunks = [];
    while (num> 0) {
      chunks.push(num % 1000);
      num = Math.floor(num / 1000);
}

    let words = "";
    for (let i = chunks.length - 1; i>= 0; i--) {
      if (chunks[i]!== 0) {
        words += convertChunk(chunks[i]) + " " + scales[i] + " ";
}
}
    return words.trim();
}

  const whole = Math.floor(amount);
  const decimal = Math.round((amount - whole) * 100);
  const kwacha = convertWholeNumber(whole);
  const ngwee = decimal> 0? convertWholeNumber(decimal) + " Ngwee": "Zero Ngwee";

  return `${kwacha} Kwacha and ${ngwee}`;
}


// Fee calculation
let penalty = 0;
if (renewalDate> january14) {
  const monthsLate = (renewalDate.getFullYear() - january14.getFullYear()) * 12 + renewalDate.getMonth() - january14.getMonth();
  penalty = renewalFee * 0.02 * monthsLate;
}

const totalFee = renewalFee + penalty;

// Format numbers with two decimals and thousands separator
const formatCurrency = (amount) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2});

feeResultParagraph.textContent = `
Renewal Fee: K${formatCurrency(renewalFee)} (${numberToWords(renewalFee)})
Penalty: K${formatCurrency(penalty)} (${numberToWords(penalty)})
Total Fee: K${formatCurrency(totalFee)} (${numberToWords(totalFee)})
`;

});

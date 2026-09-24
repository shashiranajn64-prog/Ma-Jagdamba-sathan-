export function amountToHindiWords(num: number): string {
  if (num === 0) return 'शून्य रुपये मात्र';
  
  const a = ['', 'एक ', 'दो ', 'तीन ', 'चार ', 'पाँच ', 'छह ', 'सात ', 'आठ ', 'नौ ', 'दस ', 'ग्यारह ', 'बारह ', 'तेरह ', 'चौदह ', 'पंद्रह ', 'सोलह ', 'सत्रह ', 'अठारह ', 'उन्नीस ', 'बीस ', 'इक्कीस ', 'बाईस ', 'तेईस ', 'चौबीस ', 'पच्चीस ', 'छब्बीस ', 'सत्ताईस ', 'अट्ठावीस ', 'उनतीस ', 'तीस ', 'इकतीस ', 'बत्तीस ', 'पैंतीस ', 'चौंतीस ', 'पैंतीस ', 'छत्तीस ', 'सैंतीस ', 'अड़तीस ', 'उनतालीस ', 'चालीस ', 'इकतालीस ', 'बयालीस ', 'तैंतालीस ', 'चौवालीस ', 'पैंतालीस ', 'छियालीस ', 'सैंतालीस ', 'अड़तालीस ', 'उनचास ', 'पचपन ', 'इक्यावन ', 'बावन ', 'त्रिपन ', 'चौवन ', 'पचपन ', 'छप्पन ', 'सत्तावन ', 'अट्ठावन ', 'उनसठ ', 'साठ ', 'इकसठ ', 'बासठ ', 'तिरसठ ', 'चौंसठ ', 'पैंसठ ', 'छियासठ ', 'सड़सठ ', 'अड़सठ ', 'उनहत्तर ', 'सत्तर ', 'इकहत्तर ', 'बहत्तर ', 'तिहत्तर ', 'चौहत्तर ', 'पचहत्तर ', 'छहत्तर ', 'सत्तर ', 'अट्ठात्तर ', 'उनासी ', 'अस्सी ', 'इक्यासी ', 'बयासी ', 'तिरासी ', 'चौरासी ', 'पचासी ', 'छियासी ', 'सतासी ', 'अट्ठासी ', 'नवासी ', 'नब्बे ', 'इक्यानवे ', 'बानवे ', 'तिरानवे ', 'चौरानवे ', 'पचासी ', 'छियानवे ', 'सतानवे ', 'अट्ठानवे ', 'अन्यानवे '];
  
  // Simple robust conversion for common Indian temple amounts
  if (num >= 10000000) {
    const crore = Math.floor(num / 10000000);
    return `${amountToHindiWords(crore)} करोड़ ${amountToHindiWords(num % 10000000)}`;
  }
  if (num >= 100000) {
    const lakh = Math.floor(num / 100000);
    return `${amountToHindiWords(lakh)} लाख ${amountToHindiWords(num % 100000)}`;
  }
  if (num >= 1000) {
    const thousand = Math.floor(num / 1000);
    const rem = num % 1000;
    return `${thousand === 1 ? 'एक ' : amountToHindiWords(thousand)} हजार ${rem > 0 ? amountToHindiWords(rem) : ''}रुपये मात्र`;
  }
  if (num >= 100) {
    const hundred = Math.floor(num / 100);
    const rem = num % 100;
    return `${hundred === 1 ? 'एक सौ ' : a[hundred] + 'सौ '}${rem > 0 ? amountToHindiWords(rem) : ''}रुपये मात्र`;
  }
  
  const idx = Math.min(num, a.length - 1);
  return `${a[idx]}रुपये मात्र`;
}

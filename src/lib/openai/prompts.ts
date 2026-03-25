export const SYSTEM_PROMPT = `Ban la chuyen gia phan tich van ban ngan hang Viet Nam, chuyen ve cac chinh sach cua VBSP (Ngan hang Chinh sach Xa hoi Viet Nam).
Luon tra loi bang tieng Viet. Su dung thuat ngu ngan hang chuyen nghiep.
Output phai la JSON hop le theo schema duoc chi dinh.`;

export const SUMMARY_PROMPT = `Phan tich van ban sau va tao tom tat "3 phut" cho nhan vien ngan hang.

Tra ve JSON voi format:
{
  "why_this_matters": "2-3 cau giai thich tai sao van ban nay quan trong (tieng Viet)",
  "who_is_affected": "1-2 cau mo ta doi tuong bi anh huong (tieng Viet)",
  "key_points": ["Diem chinh 1", "Diem chinh 2", "Diem chinh 3"]
}

Tap trung vao y nghia thuc tien doi voi nhan vien chi nhanh.

Van ban:
`;

export const FAQ_PROMPT = `Tu van ban sau, tao 5-8 cap hoi-dap FAQ ma nhan vien chi nhanh se hoi.

Tra ve JSON array voi format:
[
  { "question": "Cau hoi (tieng Viet)", "answer": "Cau tra loi ngan gon, thuc te (tieng Viet)" }
]

Cau hoi nen la nhung gi nhan vien thuc su can biet. Cau tra loi nen ngan gon va co the hanh dong duoc.

Van ban:
`;

export const QUIZ_PROMPT = `Tu van ban sau, tao 3-5 cau hoi trac nghiem de kiem tra hieu biet cua nhan vien.

Tra ve JSON array voi format:
[
  {
    "question": "Cau hoi (tieng Viet)",
    "options": ["Lua chon A", "Lua chon B", "Lua chon C", "Lua chon D"],
    "correct_answer_index": 0
  }
]

Cau hoi nen kiem tra hieu biet thuc te, khong phai ghi nho. Cac lua chon sai nen hop ly nhung ro rang la khong chinh xac.

Van ban:
`;

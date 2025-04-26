import express from "express";
import bodyParser from "body-parser";
import {listPharmacists, listPharmacistRequests, listAllPharmacists, readPharmacist, registerPharmacist, acceptPharmacist, chatWithContacts, getAllMyContacts} from "../controllers/pharmacistController";
import {deletePharmacist, acceptPharmacistRequest, rejectPharmacistRequest} from "../controllers/adminstratorController";
import multer from "multer";
import { verifyToken } from "../middleware/verifyTokens";
import { checkPermission } from "../middleware/userRole"; // مسار فيه checkPermission
const router = express.Router();

router.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./src/uploads/"),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

router.post("/", upload.array("files", 10), registerPharmacist);

// قائمة الصيادلة (للأدمن فقط)
router.get("/", checkPermission("pharmacists", "read"), listPharmacists);

// طلبات الصيادلة المعلقة
router.get("/listAll", verifyToken, checkPermission("pharmacists", "read"), listPharmacistRequests);

// عرض كل الصيادلة
router.get("/viewAll", verifyToken, checkPermission("pharmacists", "read"), listAllPharmacists);

// عرض صيدلي معين
router.get("/:id", verifyToken, checkPermission("pharmacists", "read", (req) => req.params.id), readPharmacist);

// دردشة مع جهات الاتصال (افترض إنها صيدلي مريض أو صيدلي صيدلي)
router.get("/chatWithContacts/:id/:search", verifyToken, checkPermission("pharmacists", "read", (req) => req.params.id),chatWithContacts);

// الحصول على كل جهات الاتصال الخاصة بي
router.get("/getAllMyContacts/:id", verifyToken, checkPermission("pharmacists", "read", (req) => req.params.id), getAllMyContacts);


// قبول طلب صيدلي
router.post("/acceptPharmacist", verifyToken, checkPermission("pharmacists", "update"), acceptPharmacistRequest);

// رفض طلب صيدلي
router.post("/rejectPharmacist", verifyToken, checkPermission("pharmacists", "update"), rejectPharmacistRequest);

// =================== PUT ===================

// تحديث بيانات صيدلي
router.put("/:id", verifyToken, checkPermission("pharmacists", "update", (req) => req.params.id), acceptPharmacist);

// =================== DELETE ===================

// حذف صيدلي
router.delete("/:id", verifyToken, checkPermission("pharmacists", "delete", (req) => req.params.id),deletePharmacist);

export default router;

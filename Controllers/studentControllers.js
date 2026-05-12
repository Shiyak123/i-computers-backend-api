// import Students from "../../models/Students.js";


// // CREATE student

// // promise with async await function

// export async function createStudent(req, res) {
//     try {
//         const newStudent = new Students(req.body);

//         await newStudent.save();

//         res.json({
//             message: "Student added successfully"
//         });

//     } catch (err) {
//         res.status(500).json({
//             message: err.message
//         });
//     }
// }
// // export function getAllStudent(req, res) {
// //     Students.find().then(
// //         (students) => {
// //             res.json(students)
// //         }
// //     )
// // }



// //when we use the "await" keyword inside of a function, we con not use it without "async" , cz od if isn't there the function my not work or block other codes
// // GET all students
// export async function getAllstudentsNew(req, res) {
//     try {
//         const students = await Student.find();
//         res.json(students);

//     } catch (err) {
//         res.status(500).json({
//             message: err.message
//         });
//     }
// }


// //promiss with .then

// // export function createStudent(req, res) {
// //     const newStudent = new Students(req.body)
// //     newStudent.save().then(
// //         () => {
// //             res.json({
// //                 massage: "Students added succssesfully"
// //             })
// //         }
// //     )
// // }




import Student from "../Models/students.js";

// CREATE student
export async function createStudent(req, res) {
    //AUTHORIZATION SECTION

    if (req.user == null) { // without token we connt create
        res.status(401).json({ message: "Unauthorized" })
        return
    }
    if (req.user.isAdmin == false) {
        res.status(403).json({ message: "forbidden, Only Admin can create the students" })
        return
    }
    try {
        const newStudent = new Student(req.body);
        await newStudent.save();

        res.json({
            message: "Student added successfully"
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

// GET all students
export async function getAllstudentsNew(req, res) {
    try {
        const students = await Student.find();
        res.json(students);

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}
import express , {Application} from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

const app : Application = express() ;


app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get('/',(req,res)=>{
    res.json({
        success: true,
        message: "TalentForge AI Backend Running"
    })
})

export default app;
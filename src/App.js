import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { AppBar, Toolbar, Typography, Button, Container, Card, CardContent, Grid, Alert, Box } from "@mui/material";




export default function App() {
  return (
    <div>
      {/* Top Navigation */}
      <AppBar position="static" color="primary">
        <Toolbar>
          
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            SafeClick
          </Typography>
          <Button color="inherit">Painel</Button>
          <Button color="inherit">Educação</Button>
          <Button color="inherit">Configurações</Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container className="mt-5">
        {/* Status Overview */}
        <Alert severity="success"  className="mb-4">
          Sua navegação está protegida.
        </Alert>

        <Grid container spacing={4}>
          {/* Verificação de Link */}
          <Grid item xs={12} md={6}>
            <Card elevation={4}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Verificar Link
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Cole um link abaixo para analisar possíveis riscos.
                </Typography>
                <div className="input-group mb-3 mt-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://exemplo.com"
                  />
                  <button className="btn btn-primary">
                    Analisar
                  </button>
                </div>
              </CardContent>
            </Card>
          </Grid>

          {/* Alertas Recentes */}
          <Grid item xs={12} md={6}>
            <Card elevation={4}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Alertas Recentes
                </Typography>
                <Box className="mt-3">
                  <Alert severity="warning"  className="mb-2">
                    Possível tentativa de phishing detectada em mensagem recente.
                  </Alert>
                  <Alert severity="info" className="mb-2">
                    Nova atualização de segurança disponível.
                  </Alert>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Educação */}
        <Card elevation={3} className="mt-5">
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Dica do Dia
            </Typography>
            <Typography variant="body1">
              Antes de clicar em qualquer link, verifique se o endereço começa com "https" e se o domínio corresponde ao site oficial.
            </Typography>
            <Button variant="outlined" className="mt-3">
              Aprender Mais
            </Button>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
